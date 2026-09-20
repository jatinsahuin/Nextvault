const fs = require('fs').promises;
const path = require('path');

class StorageProvider {
    async save(userId, sourceId, fileBuffer) {
        throw new Error('Method save() must be implemented');
    }
    async get(storagePath) {
        throw new Error('Method get() must be implemented');
    }
    async delete(storagePath) {
        throw new Error('Method delete() must be implemented');
    }
}

class LocalStorageProvider extends StorageProvider {
    constructor(baseDir = 'storage/raw') {
        super();
        this.baseDir = baseDir;
    }

    async save(userId, sourceId, fileBuffer) {
        const dir = path.join(this.baseDir, userId);
        const filePath = path.join(dir, sourceId);

        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(filePath, fileBuffer);

        return filePath;
    }

    async get(storagePath) {
        return fs.readFile(storagePath);
    }

    async delete(storagePath) {
        await fs.unlink(storagePath);
    }
}

module.exports = { StorageProvider, LocalStorageProvider };
