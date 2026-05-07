import { api } from './api.js';
import { Dashboard } from './views/dashboard.js';
import { Exercises } from './views/exercises.js';
import { Editor } from './views/editor.js';
import { Chat } from './views/chat.js';
import { Progress } from './views/progress.js';

class Router {
    constructor() {
        this.routes = {
            'dashboard': this.renderDashboard,
            'exercises': this.renderExercises,
            'editor': this.renderEditor,
            'chat': this.renderChat,
            'progress': this.renderProgress
        };
        this.container = document.getElementById('app-content');
        
        window.addEventListener('popstate', () => {
            const route = window.location.hash.replace('#/', '') || 'dashboard';
            this.navigate(route, null, false);
        });
    }

    async navigate(route, params = null, pushState = true) {
        console.log(`Navigating to ${route}`, params);
        
        if (this.routes[route]) {
            if (pushState) {
                window.history.pushState(params, '', `#/${route}`);
            }
            
            // Highlight active sidebar link
            this.updateActiveLink(route);
            
            // Show loading state (optional)
            this.container.innerHTML = '<div class="flex items-center justify-center h-full"><span class="animate-pulse text-primary font-bold">Loading...</span></div>';
            
            await this.routes[route].call(this, params);
        }
    }

    updateActiveLink(route) {
        document.querySelectorAll('[data-route]').forEach(link => {
            if (link.getAttribute('data-route') === route) {
                link.classList.add('text-primary', 'font-bold', 'bg-primary-container/10', 'border-r-2', 'border-primary');
                link.classList.remove('text-on-surface-variant');
                const icon = link.querySelector('.material-symbols-outlined');
                if (icon) icon.style.fontVariationSettings = "'FILL' 1";
            } else {
                link.classList.remove('text-primary', 'font-bold', 'bg-primary-container/10', 'border-r-2', 'border-primary');
                link.classList.add('text-on-surface-variant');
                const icon = link.querySelector('.material-symbols-outlined');
                if (icon) icon.style.fontVariationSettings = "'FILL' 0";
            }
        });
    }

    async renderDashboard() {
        const user = await api.getUser();
        const sessions = await api.getSessions();
        this.container.innerHTML = Dashboard({ user, sessions });
    }

    async renderExercises() {
        console.log('[ROUTER] Rendering exercises view...');
        const exercises = await api.getExercises();
        console.log(`[ROUTER] Loaded ${exercises.length} exercises. Updating container.`);
        this.container.innerHTML = Exercises({ exercises });
    }

    async renderEditor(params) {
        const id = params?.id;
        const exercise = id ? await api.getExerciseById(id) : null;
        this.container.innerHTML = Editor({ exercise });
    }

    async renderChat() {
        const history = await api.getChatHistory();
        this.container.innerHTML = Chat({ history });
    }

    async renderProgress() {
        const progress = await api.getProgress();
        this.container.innerHTML = Progress({ progress });
    }
}

export const router = new Router();
window.router = router; // Expose to global for inline onclick handlers
