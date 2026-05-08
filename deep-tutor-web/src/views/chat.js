import { api } from '../api.js';

export const Chat = (data) => {
    const { user, conversations, activeId, messages } = data;
    const activeConversation = conversations.find(c => c.id == activeId);
    
    // Configure marked with highlight.js (Modern syntax)
    if (window.marked && window.hljs) {
        marked.use({
            renderer: {
                code(code, lang) {
                    // Handle cases where 'code' might be an object (marked v4+)
                    const codeText = typeof code === 'string' ? code : (code.text || '');
                    const validLang = !!(lang && hljs.getLanguage(lang));
                    const highlighted = validLang ? hljs.highlight(codeText, { language: lang }).value : hljs.highlightAuto(codeText).value;
                    return `<pre><code class="hljs ${lang}">${highlighted}</code></pre>`;
                }
            },
            breaks: true,
            gfm: true
        });
    }

    const renderMarkdown = (text) => {
        if (window.marked) {
            return marked.parse(text);
        }
        return text;
    };

    return `
    <div id="chat-container" data-active-id="${activeId}" class="h-full flex gap-6 animate-fade-in w-full overflow-hidden">
        <!-- Sidebar de Chats -->
        <aside class="w-72 bg-surface-container border border-outline-variant rounded-2xl flex flex-col shrink-0 overflow-hidden">
            <header class="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-high">
                <h3 class="font-bold text-sm uppercase tracking-wider text-primary">Mis Conversaciones</h3>
                <button id="add-chat-btn" class="p-1 hover:bg-primary/20 rounded-full transition-colors text-primary" title="Nueva conversación">
                    <span class="material-symbols-outlined text-xl">add_circle</span>
                </button>
            </header>
            
            <div class="flex-1 overflow-y-auto p-2 space-y-1">
                ${conversations.map(conv => `
                    <div class="group relative">
                        <button 
                            onclick="window.router.navigate('chat', { id: ${conv.id} })"
                            class="w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${conv.id == activeId ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' : 'hover:bg-surface-container-highest text-on-surface-variant'}"
                        >
                            <span class="material-symbols-outlined text-lg ${conv.id == activeId ? 'fill-1' : ''}">chat_bubble</span>
                            <span class="truncate text-sm font-medium">Conversación ${conv.id}</span>
                        </button>
                        <button 
                            onclick="window.deleteChat(${conv.id}, event)"
                            class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 opacity-0 group-hover:opacity-100 hover:text-error transition-all"
                            title="Eliminar chat"
                        >
                            <span class="material-symbols-outlined text-lg">delete</span>
                        </button>
                    </div>
                `).join('')}
                ${conversations.length === 0 ? '<p class="text-xs text-outline p-4 text-center">No hay chats activos</p>' : ''}
            </div>
        </aside>

        <!-- Área de Chat -->
        <section class="flex-1 flex flex-col bg-surface-container border border-outline-variant rounded-2xl overflow-hidden relative">
            <header class="p-4 border-b border-outline-variant bg-surface-container-high flex justify-between items-center">
                <div>
                    <h2 class="font-bold">Mentor IA</h2>
                    <p class="text-[10px] font-bold text-outline uppercase tracking-widest">
                        ${activeConversation ? `ID: ${activeConversation.id} • Sesión Activa` : 'Selecciona una conversación'}
                    </p>
                </div>
                <div class="flex gap-2">
                    <span id="model-indicator" class="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-primary/10 text-primary rounded-full uppercase">
                        <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> Gemini 2.5 Flash
                    </span>
                </div>
            </header>

            <div id="chat-messages" class="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                ${messages.length === 0 ? `
                    <div class="h-full flex flex-col items-center justify-center text-center opacity-40">
                        <span class="material-symbols-outlined text-6xl mb-4">smart_toy</span>
                        <p class="text-sm font-medium">¡Hola! Soy tu mentor personal.<br>¿En qué puedo ayudarte con tu código hoy?</p>
                    </div>
                ` : messages.map(msg => `
                    <div class="flex flex-col gap-6">
                        <!-- Mensaje Usuario -->
                        <div class="flex justify-end">
                            <div class="max-w-[85%] bg-primary-container text-on-primary-container p-4 rounded-2xl rounded-tr-none shadow-sm">
                                <div class="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-surface-container-lowest">
                                    ${renderMarkdown(msg.mensaje)}
                                </div>
                                <p class="text-[9px] mt-2 font-bold uppercase opacity-50 text-right">Tú</p>
                            </div>
                        </div>
                        <!-- Respuesta Mentor -->
                        ${msg.respuesta ? `
                            <div class="flex justify-start">
                                <div class="max-w-[85%] bg-surface-container-highest border border-outline-variant text-on-surface p-4 rounded-2xl rounded-tl-none shadow-sm">
                                    <div class="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-surface-container-lowest prose-pre:p-4 prose-pre:rounded-xl">
                                        ${renderMarkdown(msg.respuesta)}
                                    </div>
                                    <p class="text-[9px] mt-2 font-bold uppercase opacity-50">Mentor IA</p>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
                
                <!-- Typing Indicator (Minimalist Loading) -->
                <div id="typing-indicator" class="hidden flex justify-start animate-fade-in">
                    <div class="typing-indicator text-primary">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>

            <footer class="p-4 bg-surface-container-high border-t border-outline-variant">
                <form id="chat-form" class="relative">
                    <textarea 
                        id="chat-input"
                        rows="1"
                        class="w-full bg-surface-container border border-outline-variant rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-primary transition-all text-sm resize-none" 
                        placeholder="Pregunta sobre Python, algoritmos o tu progreso..."
                    ></textarea>
                    <button type="submit" id="send-btn" class="absolute right-2 bottom-2 text-primary p-2 hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-30">
                        <span class="material-symbols-outlined">send</span>
                    </button>
                </form>
            </footer>
        </section>
    </div>
    `;
};

// Global handlers for the dynamic parts
window.deleteChat = async (id, event) => {
    event.stopPropagation();
    if (confirm('¿Estás seguro de que quieres eliminar esta conversación?')) {
        await api.deleteConversation(id);
        window.router.navigate('chat', null, true);
    }
};

window.initChat = (chatHistory = []) => {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const addChatBtn = document.getElementById('add-chat-btn');
    const messagesContainer = document.getElementById('chat-messages');
    const typingIndicator = document.getElementById('typing-indicator');
    const modelIndicator = document.getElementById('model-indicator');
    
    if (!chatForm || !chatInput) return;

    // Load Personality Rules and Skills
    let systemInstruction = "";
    const loadMentorConfig = async () => {
        try {
            const [rulesRes, skillsRes] = await Promise.all([
                fetch('/dashboard/assets/mentor/rules.md'),
                fetch('/dashboard/assets/mentor/skills.md')
            ]);
            const rules = await rulesRes.text();
            const skills = await skillsRes.text();
            systemInstruction = `${rules}\n\n${skills}`;
        } catch (e) {
            systemInstruction = "Eres un mentor de programación experto.";
        }
    };
    loadMentorConfig();

    // Auto-resize textarea
    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = chatInput.scrollHeight + 'px';
    });

    addChatBtn.addEventListener('click', async () => {
        const user = await api.getUser();
        const newConv = await api.createConversation(user.id);
        if (newConv) {
            window.router.navigate('chat', { id: newConv.id });
        }
    });

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (!message) return;

        const user = await api.getUser();
        const chatContainer = document.getElementById('chat-container');
        const finalActiveId = chatContainer.getAttribute('data-active-id');

        if (!finalActiveId || finalActiveId === 'undefined' || finalActiveId === 'null') {
            alert('Por favor selecciona o crea una conversación primero.');
            return;
        }

        // UI Feedback - Show Minimalist Loading
        chatInput.value = '';
        chatInput.style.height = 'auto';
        chatInput.disabled = true;
        document.getElementById('send-btn').disabled = true;
        
        if (typingIndicator) {
            typingIndicator.classList.remove('hidden');
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemInstruction,
                    message,
                    history: chatHistory
                })
            });

            if (!response.ok) throw new Error('Error en el servidor de IA');
            
            const data = await response.json();
            const aiText = data.text;
            
            // Update UI with used model
            modelIndicator.innerHTML = `
                <span class="w-1.5 h-1.5 rounded-full ${data.model.includes('Grok') ? 'bg-tertiary' : 'bg-primary'} animate-pulse"></span> 
                ${data.model}
            `;

            // Save and refresh
            await api.saveChatMessage(user.id, finalActiveId, message, aiText);
            window.router.navigate('chat', { id: finalActiveId }, false);
        } catch (error) {
            console.error('Chat Error:', error);
            alert('Hubo un error al contactar al mentor. Por favor, reintenta.');
            if (typingIndicator) typingIndicator.classList.add('hidden');
        } finally {
            chatInput.disabled = false;
            document.getElementById('send-btn').disabled = false;
            chatInput.focus();
        }
    });

    // Scroll to bottom
    if (messagesContainer) messagesContainer.scrollTop = messagesContainer.scrollHeight;
};
