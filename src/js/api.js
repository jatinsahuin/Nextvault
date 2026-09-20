/**
 * NextVault API Client
 * The single point of communication between the Application Layer (UI)
 * and the Backend Orchestration Layer.
 */
export const api = {
    async uploadSource(file) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('http://localhost:3000/sources', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Upload failed');
        }

        return response.json();
    },

    async getSourceStatus(sourceId) {
        const response = await fetch(`http://localhost:3000/sources/${sourceId}/status`);

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Status check failed');
        }

        return response.json();
    }
};
