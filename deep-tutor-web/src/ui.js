/**
 * UI Utilities for DeepTutor
 * Custom dialogs and notifications
 */

export const ui = {
    /**
     * Show a custom confirmation dialog
     * @param {Object} options { title, message, type: 'warning'|'danger', confirmText, cancelText }
     * @returns {Promise<boolean>}
     */
    confirm: ({ title, message, type = 'warning', confirmText = 'Confirmar', cancelText = 'Cancelar' }) => {
        return new Promise((resolve) => {
            // Remove existing modal if any
            const existing = document.getElementById('custom-modal');
            if (existing) existing.remove();

            const icon = type === 'danger' ? 'delete_forever' : 'warning';
            const btnClass = type === 'danger' ? 'modal-btn-danger' : 'modal-btn-confirm';

            const modalHTML = `
                <div id="custom-modal" class="modal-overlay">
                    <div class="modal-container">
                        <div class="modal-icon ${type}">
                            <span class="material-symbols-outlined text-2xl">${icon}</span>
                        </div>
                        <h3 class="modal-title">${title}</h3>
                        <p class="modal-message">${message}</p>
                        <div class="modal-actions">
                            <button id="modal-cancel" class="modal-btn modal-btn-cancel">${cancelText}</button>
                            <button id="modal-confirm" class="modal-btn ${btnClass}">${confirmText}</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHTML);
            const overlay = document.getElementById('custom-modal');
            
            // Trigger animation
            setTimeout(() => overlay.classList.add('active'), 10);

            const cleanup = (result) => {
                overlay.classList.remove('active');
                setTimeout(() => {
                    overlay.remove();
                    resolve(result);
                }, 200);
            };

            document.getElementById('modal-cancel').onclick = () => cleanup(false);
            document.getElementById('modal-confirm').onclick = () => cleanup(true);
            
            // Close on overlay click
            overlay.onclick = (e) => {
                if (e.target === overlay) cleanup(false);
            };
        });
    },

    /**
     * Show a custom alert dialog
     * @param {Object} options { title, message, type: 'warning'|'danger', btnText }
     */
    alert: ({ title, message, type = 'warning', btnText = 'Entendido' }) => {
        return new Promise((resolve) => {
            const existing = document.getElementById('custom-modal');
            if (existing) existing.remove();

            const icon = type === 'danger' ? 'error' : 'info';

            const modalHTML = `
                <div id="custom-modal" class="modal-overlay">
                    <div class="modal-container">
                        <div class="modal-icon ${type}">
                            <span class="material-symbols-outlined text-2xl">${icon}</span>
                        </div>
                        <h3 class="modal-title">${title}</h3>
                        <p class="modal-message">${message}</p>
                        <div class="modal-actions">
                            <button id="modal-confirm" class="modal-btn modal-btn-confirm">${btnText}</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHTML);
            const overlay = document.getElementById('custom-modal');
            
            setTimeout(() => overlay.classList.add('active'), 10);

            const cleanup = () => {
                overlay.classList.remove('active');
                setTimeout(() => {
                    overlay.remove();
                    resolve();
                }, 200);
            };

            document.getElementById('modal-confirm').onclick = cleanup;
            overlay.onclick = (e) => {
                if (e.target === overlay) cleanup();
            };
        });
    },

    /**
     * Show a prompt-like dialog (Custom)
     */
    prompt: ({ title, message, defaultValue = '', placeholder = '', type = 'warning', confirmText = 'Aceptar', cancelText = 'Cancelar' }) => {
        return new Promise((resolve) => {
            const existing = document.getElementById('custom-modal');
            if (existing) existing.remove();

            const icon = 'edit';

            const modalHTML = `
                <div id="custom-modal" class="modal-overlay">
                    <div class="modal-container">
                        <div class="modal-icon ${type}">
                            <span class="material-symbols-outlined text-2xl">${icon}</span>
                        </div>
                        <h3 class="modal-title">${title}</h3>
                        <p class="modal-message">${message}</p>
                        <div class="mb-6">
                            <input 
                                id="modal-input" 
                                type="text" 
                                value="${defaultValue}" 
                                placeholder="${placeholder}"
                                class="w-full bg-surface-container border border-outline-variant rounded-xl py-3 px-4 focus:outline-none focus:border-primary transition-all text-sm"
                                autofocus
                            >
                        </div>
                        <div class="modal-actions">
                            <button id="modal-cancel" class="modal-btn modal-btn-cancel">${cancelText}</button>
                            <button id="modal-confirm" class="modal-btn modal-btn-confirm">${confirmText}</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHTML);
            const overlay = document.getElementById('custom-modal');
            const input = document.getElementById('modal-input');
            
            setTimeout(() => {
                overlay.classList.add('active');
                input.focus();
                input.select();
            }, 10);

            const cleanup = (result) => {
                overlay.classList.remove('active');
                setTimeout(() => {
                    overlay.remove();
                    resolve(result);
                }, 200);
            };

            document.getElementById('modal-cancel').onclick = () => cleanup(null);
            document.getElementById('modal-confirm').onclick = () => cleanup(input.value);
            
            input.onkeydown = (e) => {
                if (e.key === 'Enter') cleanup(input.value);
                if (e.key === 'Escape') cleanup(null);
            };

            overlay.onclick = (e) => {
                if (e.target === overlay) cleanup(null);
            };
        });
    }
};

window.ui = ui;
