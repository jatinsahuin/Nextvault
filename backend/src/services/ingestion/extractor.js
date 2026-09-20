class Extractor {
    async extract(fileBuffer) {
        throw new Error('Method extract() must be implemented');
    }
}

class TextExtractor extends Extractor {
    async extract(fileBuffer) {
        const text = fileBuffer.toString('utf8');
        return {
            content: text,
            language: 'en',
            structure: { type: 'plain-text' }
        };
    }
}

class MarkdownExtractor extends Extractor {
    async extract(fileBuffer) {
        const text = fileBuffer.toString('utf8');
        // In a real implementation, we would parse MD headings here
        return {
            content: text,
            language: 'en',
            structure: { type: 'markdown' }
        };
    }
}

class ExtractorFactory {
    static getExtractor(mimeType) {
        switch (mimeType) {
            case 'text/plain':
                return new TextExtractor();
            case 'text/markdown':
            case 'text/x-markdown':
                return new MarkdownExtractor();
            default:
                throw new Error(`Unsupported MIME type: ${mimeType}`);
        }
    }
}

module.exports = { ExtractorFactory };
