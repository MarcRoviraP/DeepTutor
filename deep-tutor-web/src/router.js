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
            const fullRoute = window.location.hash.replace('#/', '');
            const parts = fullRoute.split('/');
            const route = parts[0] || 'dashboard';
            const id = parts[1];
            this.navigate(route, id ? { id } : null, false);
        });
    }

    async navigate(route, params = null, pushState = true) {
        console.log(`Navigating to ${route}`, params);
        
        if (this.routes[route]) {
            if (pushState) {
                const path = params?.id ? `${route}/${params.id}` : route;
                window.history.pushState(params, '', `#/${path}`);
            }
            
            // Highlight active sidebar link
            this.updateActiveLink(route);
            
            // Only show loading state if we're changing the base route to avoid flickering
            if (this.currentRoute !== route) {
                this.container.innerHTML = '<div class="flex items-center justify-center h-full"><span class="animate-pulse text-primary font-bold">Cargando...</span></div>';
            }
            this.currentRoute = route;
            
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
        if (typeof window.initEditor === 'function') {
            window.initEditor(exercise);
        }
    }

    async renderChat(params) {
        const user = await api.getUser();
        if (!user || !user.id) {
            this.container.innerHTML = '<div class="p-8">Por favor, inicia sesión para usar el Mentor IA.</div>';
            return;
        }

        // Fetch conversations for user
        let conversations = await api.getConversations(user.id);
        
        // If no conversations exist, create one automatically
        if (conversations.length === 0) {
            const newConv = await api.createConversation(user.id);
            if (newConv) {
                conversations = [newConv];
            }
        }

        // Use active id from params or default to the first one
        const activeId = params?.id || conversations[0]?.id;
        let messages = [];
        if (activeId) {
            messages = await api.getChatMessages(activeId);
        }

        this.container.innerHTML = Chat({ 
            user, 
            conversations, 
            activeId, 
            messages 
        });
        
        // Initialize chat logic (event listeners, etc.)
        if (typeof window.initChat === 'function') {
            window.initChat(messages);
        }
    }

    async renderProgress() {
        const progress = await api.getProgress();
        this.container.innerHTML = Progress({ progress });
    }
}

export const router = new Router();
window.router = router; // Expose to global for inline onclick handlers
