export class IngestionUI {
    constructor() {
        this.uploadInput = document.getElementById('knowledge-upload');
        this.statusContainer = document.getElementById('ingestion-status');
        this.init();
    }

    init() {
        if (!this.uploadInput) return;

        this.uploadInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            await this.handleUpload(file);
        });
    }

    async handleUpload(file) {
        try {
            this.showNotification('Uploading...', 'info');

            const { sourceId, status } = await api.uploadSource(file);

            // Start polling for status
            await this.pollStatus(sourceId);

        } catch (err) {
            this.showNotification(`Error: ${err.message}`, 'error');
        }
    }

    async pollStatus(sourceId) {
        const interval = setInterval(async () => {
            try {
                const { status } = await api.getSourceStatus(sourceId);

                switch(status) {
                    case 'VALIDATING':
                        this.showNotification('Validating file...', 'info');
                        break;
                    case 'EXTRACTING':
                        this.showNotification('Extracting knowledge...', 'info');
                        break;
                    case 'PROCESSING':
                        this.showNotification('Indexing in Memory Engine...', 'info');
                        break;
                    case 'COMPLETED':
                        this.showNotification('Knowledge Indexed! ✅', 'success');
                        clearInterval(interval);
                        break;
                    case 'FAILED':
                        this.showNotification('Processing failed. Please try again.', 'error');
                        clearInterval(interval);
                        break;
                }
            } catch (err) {
                this.showNotification('Connection lost. Retrying...', 'warning');
            }
        }, 2000);
    }

    showNotification(message, type = 'info') {
        if (!this.statusContainer) return;

        this.statusContainer.innerText = message;
        this.statusContainer.className = `ingestion-status is-visible status-${type}`;

        if (type === 'success') {
            setTimeout(() => {
                this.statusContainer.classList.remove('is-visible');
            }, 5000);
        }
    }
}
