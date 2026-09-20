-- NextVault Foundation Schema (Stage 1)
-- Focus: Provenance, Ownership, and Ingestion Lifecycle

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector"; -- Prepared for Stage 2

-- Users Table (Basic foundation for tenant isolation)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Source Table (The Birth Certificate)
CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    checksum TEXT NOT NULL, -- SHA-256 for content identity
    storage_path TEXT NOT NULL,
    provenance JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Normalized Content Table (The Bridge)
CREATE TABLE IF NOT EXISTS normalized_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    structure JSONB DEFAULT '{}',
    extraction_version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ingestion Job Table (The State Machine)
CREATE TABLE IF NOT EXISTS ingestion_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('RECEIVED', 'VALIDATING', 'EXTRACTING', 'PROCESSING', 'COMPLETED', 'FAILED')),
    attempts INT DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance and isolation
CREATE INDEX idx_sources_user_id ON sources(user_id);
CREATE INDEX idx_sources_checksum ON sources(checksum);
CREATE INDEX idx_normalized_source_id ON normalized_content(source_id);
CREATE INDEX idx_jobs_source_id ON ingestion_jobs(source_id);
CREATE INDEX idx_jobs_status ON ingestion_jobs(status);
