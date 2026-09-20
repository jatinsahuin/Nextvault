const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const { LocalStorageProvider } = require('../providers/storage/storage');
const { ExtractorFactory } = require('./extractor');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'nextvault',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
});

const storage = new LocalStorageProvider();

async function createSource(userId, file, metadata = {}) {
    const fileBuffer = await file.toBuffer();
    const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const sourceId = uuidv4();

    // 1. Storage
    const storagePath = await storage.save(userId, sourceId, fileBuffer);

    // 2. DB Record
    await pool.query(
        `INSERT INTO sources (id, user_id, original_filename, mime_type, file_size, checksum, storage_path, provenance)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [sourceId, userId, file.filename, file.mimetype, file.filesize, checksum, storagePath, metadata]
    );

    // 3. Initial Job
    await pool.query(
        `INSERT INTO ingestion_jobs (source_id, status) VALUES ($1, 'RECEIVED')`,
        [sourceId]
    );

    return { sourceId, status: 'RECEIVED' };
}

async function getSourceStatus(sourceId) {
    const res = await pool.query(
        `SELECT status FROM ingestion_jobs WHERE source_id = $1`,
        [sourceId]
    );
    if (res.rows.length === 0) throw new Error('Source not found');
    return res.rows[0].status;
}

async function processIngestion(sourceId) {
    try {
        // Update state to VALIDATING
        await pool.query(`UPDATE ingestion_jobs SET status = 'VALIDATING', started_at = NOW() WHERE source_id = $1`, [sourceId]);

        const sourceRes = await pool.query(`SELECT * FROM sources WHERE id = $1`, [sourceId]);
        const source = sourceRes.rows[0];

        // Update state to EXTRACTING
        await pool.query(`UPDATE ingestion_jobs SET status = 'EXTRACTING' WHERE source_id = $1`, [sourceId]);

        const fileBuffer = await storage.get(source.storage_path);
        const extractor = ExtractorFactory.getExtractor(source.mime_type);
        const normalized = await extractor.extract(fileBuffer);

        // Save Normalized Content
        await pool.query(
            `INSERT INTO normalized_content (source_id, content, language, structure) VALUES ($1, $2, $3, $4)`,
            [sourceId, normalized.content, normalized.language, normalized.structure]
        );

        // Final State
        await pool.query(`UPDATE ingestion_jobs SET status = 'COMPLETED', completed_at = NOW() WHERE source_id = $1`, [sourceId]);

    } catch (err) {
        await pool.query(`UPDATE ingestion_jobs SET status = 'FAILED', error_message = $1 WHERE source_id = $2`, [err.message, sourceId]);
    }
}

module.exports = { createSource, getSourceStatus, processIngestion };
