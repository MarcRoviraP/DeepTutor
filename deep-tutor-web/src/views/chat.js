import { api } from '../api.js';

export const Chat = (data) => {
    const { user, conversations, activeId, messages } = data;
    const activeConversation = conversations.find(c => c.id == activeId);
    
    if (window.marked && window.hljs) {
        marked.use({
            renderer: {
                code(code, lang) {
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
        if (window.marked) return marked.parse(text);
        return text;
    };

    return `
    <div id="chat-container" data-active-id="${activeId}" class="h-full flex gap-6 animate-fade-in w-full overflow-hidden">
        <!-- Sidebar de Chats -->
        <aside class="w-72 bg-surface-container border border-outline-variant rounded-2xl flex flex-col shrink-0 overflow-hidden shadow-sm">
            <header class="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-high">
                <h3 class="font-bold text-sm uppercase tracking-wider text-primary">Conversaciones</h3>
                <button id="add-chat-btn" class="p-1 hover:bg-primary/20 rounded-full transition-colors text-primary" title="Nueva conversación">
                    <span class="material-symbols-outlined text-xl">add_circle</span>
                </button>
            </header>
            
            <div class="flex-1 overflow-y-auto p-2 space-y-1">
                ${conversations.map(conv => `
                    <div id="conv-row-${conv.id}" class="group relative">
                        <button 
                            onclick="window.router.navigate('chat', { id: ${conv.id} })"
                            class="w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${conv.id == activeId ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' : 'hover:bg-surface-container-highest text-on-surface-variant'}"
                        >
                            <span class="material-symbols-outlined text-lg ${conv.id == activeId ? 'fill-1' : ''}">chat_bubble</span>
                            <span class="conv-title truncate text-sm font-medium">${conv.nombre || 'Conversación'}</span>
                        </button>
                        <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                                onclick="window.renameChat(${conv.id}, '${(conv.nombre || '').replace(/'/g, "\\'")}', event)"
                                class="p-1 hover:text-primary transition-all"
                                title="Renombrar"
                            >
                                <span class="material-symbols-outlined text-base">edit</span>
                            </button>
                            <button 
                                onclick="window.deleteChat(${conv.id}, event)"
                                class="p-1 hover:text-error transition-all"
                                title="Eliminar chat"
                            >
                                <span class="material-symbols-outlined text-base">delete</span>
                            </button>
                        </div>
                    </div>
                `).join('')}
                ${conversations.length === 0 ? '<p class="text-xs text-outline p-4 text-center">No hay chats activos</p>' : ''}
            </div>

            <!-- Panel de Gestos (Debug/Tests) -->
            <div class="p-3 border-t border-outline-variant bg-surface-container-low">
                <p class="text-[9px] font-bold text-outline uppercase mb-2 px-1">Control del Mentor</p>
                <div id="gesture-controls" class="grid grid-cols-2 gap-1.5 min-h-[60px]">
                    <p class="col-span-2 text-[8px] text-outline text-center py-4 animate-pulse uppercase tracking-tighter">Conectando con el Mentor...</p>
                </div>
            </div>
        </aside>

        <!-- Área Principal de Chat -->
        <div class="flex-1 flex gap-6 overflow-hidden">
            <section class="flex-1 flex flex-col bg-surface-container border border-outline-variant rounded-2xl overflow-hidden relative shadow-sm">
                <header class="p-4 border-b border-outline-variant bg-surface-container-high flex justify-between items-center">
                    <div>
                        <h2 class="font-bold text-on-surface">Arquitecto Mentor</h2>
                        <p id="active-chat-title" class="text-[10px] font-bold text-outline uppercase tracking-widest">
                            ${activeConversation ? (activeConversation.nombre || `Sesión Activa #${activeConversation.id}`) : 'Inicia una conversación'}
                        </p>
                    </div>
                    <div class="flex items-center gap-3">
                        <button id="toggle-mentor-btn" class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-outline-variant hover:bg-surface-container-highest transition-all text-xs font-bold uppercase tracking-tight text-on-surface-variant">
                            <span class="material-symbols-outlined text-lg">face_6</span>
                            <span id="mentor-btn-text">Ver Mentor</span>
                        </button>
                        <span id="model-indicator" class="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-primary/10 text-primary rounded-full uppercase">
                            <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> Gemini 2.5
                        </span>
                    </div>
                </header>

                <div id="chat-messages" class="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                    ${messages.length === 0 ? `
                        <div class="h-full flex flex-col items-center justify-center text-center opacity-40">
                            <span class="material-symbols-outlined text-6xl mb-4 text-primary">smart_toy</span>
                            <p class="text-sm font-medium">Arquitecto Senior conectado.<br>¿Qué estamos construyendo hoy?</p>
                        </div>
                    ` : messages.map(msg => `
                        <div class="flex flex-col gap-6">
                            <div class="flex justify-end">
                                <div class="max-w-[85%] bg-primary-container text-on-primary-container p-4 rounded-2xl rounded-tr-none shadow-sm">
                                    <div class="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed">
                                        ${renderMarkdown(msg.mensaje)}
                                    </div>
                                    <p class="text-[9px] mt-2 font-bold uppercase opacity-50 text-right">Tú</p>
                                </div>
                            </div>
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
                            placeholder="Escribe tu duda técnica..."
                        ></textarea>
                        <button type="submit" id="send-btn" class="absolute right-2 bottom-2 text-primary p-2 hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-30">
                            <span class="material-symbols-outlined">send</span>
                        </button>
                    </form>
                </footer>
            </section>

            <!-- Sidebar Mentor 3D (Integrado) -->
            <aside id="mentor-sidebar" class="hidden w-72 bg-surface-container border border-outline-variant rounded-2xl flex flex-col shrink-0 overflow-hidden shadow-xl animate-fade-in">
                <header class="p-4 border-b border-outline-variant bg-surface-container-high flex justify-between items-center">
                    <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <h3 class="font-bold text-xs uppercase tracking-widest text-on-surface">Presencia del Mentor</h3>
                    </div>
                    <button id="close-mentor-btn" class="p-1 hover:bg-surface-container-highest rounded-full transition-colors text-on-surface-variant">
                        <span class="material-symbols-outlined text-lg">close</span>
                    </button>
                </header>
                <div class="flex-1 bg-[#13131b] relative group">
                    <iframe id="mentor-iframe" src="/dashboard/mentor-avatar.html" class="w-full h-full border-none"></iframe>
                    <!-- Vignette overlay for deeper integration -->
                    <div class="absolute inset-0 pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.5)]"></div>
                </div>
                <div class="p-4 bg-surface-container-high border-t border-outline-variant">
                    <p class="text-[10px] text-outline text-center font-bold uppercase tracking-tighter">Sincronización de voz activa • Piper TTS</p>
                </div>
            </aside>
        </div>
    </div>
    `;
};

// Global handlers
window.renameChat = async (id, currentName, event) => {
    if (event) event.stopPropagation();
    
    const newName = await ui.prompt({
        title: 'Renombrar sesión',
        message: 'Introduce el nuevo nombre para esta mentoría:',
        defaultValue: currentName,
        placeholder: 'Ej: Fundamentos de React',
        type: 'warning'
    });
    if (newName === null || newName.trim() === '' || newName === currentName) return;

    const trimmedName = newName.trim();

    try {
        const result = await api.updateConversation(id, { nombre: trimmedName });
        if (result) {
            // 1. Actualizar el título en la lista lateral
            const row = document.getElementById(`conv-row-${id}`);
            if (row) {
                const titleSpan = row.querySelector('.conv-title');
                if (titleSpan) titleSpan.innerText = trimmedName;
                
                // Actualizar el atributo onclick del botón de editar para el próximo prompt
                const editBtn = row.querySelector('button[title="Renombrar"]');
                if (editBtn) {
                    editBtn.setAttribute('onclick', `window.renameChat(${id}, '${trimmedName.replace(/'/g, "\\'")}', event)`);
                }
            }

            // 2. Si es el chat activo, actualizar el header
            const container = document.getElementById('chat-container');
            if (container && container.dataset.activeId == id) {
                const activeTitle = document.getElementById('active-chat-title');
                if (activeTitle) activeTitle.innerText = trimmedName;
            }
        }
    } catch (error) {
        console.error('Error al renombrar:', error);
        await ui.alert({
            title: 'Error de actualización',
            message: 'No pudimos renombrar la conversación en este momento. Inténtalo de nuevo más tarde.',
            type: 'danger'
        });
    }
};

window.triggerGesture = (name) => {
    const mentorIframe = document.getElementById('mentor-iframe');
    if (mentorIframe && mentorIframe.contentWindow) {
        console.log(`[CHAT] Disparando animación: ${name}`);
        const isOneShot = !name.toLowerCase().includes('idle') && !name.toLowerCase().includes('talk');
        mentorIframe.contentWindow.postMessage({ 
            type: 'gesture', 
            gesture: name,
            oneShot: isOneShot
        }, '*');
    }
};

window.setMentorMood = (mood) => {
    const mentorIframe = document.getElementById('mentor-iframe');
    if (mentorIframe && mentorIframe.contentWindow) {
        console.log(`[CHAT] Cambiando mood del mentor a: ${mood}`);
        mentorIframe.contentWindow.postMessage({ type: 'mood', value: mood }, '*');
    }
};

// Escuchar animaciones detectadas por el mentor
window.addEventListener('message', (e) => {
    if (e.data.type === 'animations_loaded') {
        console.log('[CHAT] Recibidas animaciones del mentor:', e.data.animations);
        const container = document.getElementById('gesture-controls');
        if (!container) return;
        
        const buttonsHTML = e.data.animations.map(name => {
            let icon = 'motion_photos_on';
            let label = name;
            
            const lower = name.toLowerCase();
            if (lower.includes('idle')) { icon = 'timer'; label = 'Espera'; }
            else if (lower.includes('talk')) { icon = 'forum'; label = 'Hablar'; }
            else if (lower.includes('wave')) { icon = 'front_hand'; label = 'Saludar'; }
            else if (lower.includes('jump')) { icon = 'vertical_align_top'; label = 'Saltar'; }
            else if (lower.includes('yes')) { icon = 'check_circle'; label = 'Sí'; }
            else if (lower.includes('no')) { icon = 'cancel'; label = 'No'; }
            else if (lower.includes('dance')) { icon = 'celebration'; label = 'Baile'; }
            else if (lower.includes('thumbs')) { icon = 'thumb_up'; label = 'OK'; }
            
            return `
                <button onclick="window.triggerGesture('${name}')" class="text-[9px] py-1.5 px-2 bg-surface-container hover:bg-primary/10 hover:text-primary border border-outline-variant rounded-lg transition-all flex items-center justify-center gap-1 font-bold truncate">
                    <span class="material-symbols-outlined !text-[14px]">${icon}</span>
                    ${label.toUpperCase()}
                </button>
            `;
        }).join('');

        // Añadir botones de moods
        const moods = [
            { id: 'normal', icon: 'visibility', label: 'Normal', color: 'text-cyan-400' },
            { id: 'error', icon: 'error', label: 'Error', color: 'text-red-500' },
            { id: 'alert', icon: 'warning', label: 'Alerta', color: 'text-amber-500' },
            { id: 'love', icon: 'favorite', label: 'Love', color: 'text-pink-500' }
        ];
        
        const moodsHTML = `
            <div class="col-span-full border-t border-outline-variant my-1 pt-2"></div>
            ${moods.map(m => `
                <button onclick="window.setMentorMood('${m.id}')" class="text-[9px] py-1.5 px-2 bg-surface-container hover:bg-primary/10 border border-outline-variant rounded-lg transition-all flex items-center justify-center gap-1 font-bold ${m.color}">
                    <span class="material-symbols-outlined !text-[14px]">${m.icon}</span>
                    ${m.label.toUpperCase()}
                </button>
            `).join('')}
        `;

        container.innerHTML = buttonsHTML + moodsHTML;
    }
});

window.deleteChat = async (id, event) => {
    event.stopPropagation();
    const confirmed = await ui.confirm({
        title: '¿Eliminar conversación?',
        message: 'Esta acción borrará todo el historial de mensajes de forma permanente. No podrás deshacerlo.',
        type: 'danger',
        confirmText: 'Sí, eliminar',
        cancelText: 'Mantener chat'
    });

    if (confirmed) {
        try {
            await api.deleteConversation(id);
            
            // 1. Eliminar de la UI lateral
            const row = document.getElementById(`conv-row-${id}`);
            if (row) row.remove();

            // 2. Si era el activo, navegar a otro o limpiar
            const container = document.getElementById('chat-container');
            if (container && container.dataset.activeId == id) {
                window.router.navigate('chat', null, true);
            }
        } catch (error) {
            console.error('Error al borrar:', error);
        }
    }
};

window.initChat = (chatHistory = []) => {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const addChatBtn = document.getElementById('add-chat-btn');
    const messagesContainer = document.getElementById('chat-messages');
    const typingIndicator = document.getElementById('typing-indicator');
    const modelIndicator = document.getElementById('model-indicator');
    
    const toggleMentorBtn = document.getElementById('toggle-mentor-btn');
    const closeMentorBtn = document.getElementById('close-mentor-btn');
    const mentorSidebar = document.getElementById('mentor-sidebar');
    const mentorIframe = document.getElementById('mentor-iframe');
    const mentorBtnText = document.getElementById('mentor-btn-text');

    let isMentorVisible = false;

    const updateMentorVisibility = (visible) => {
        isMentorVisible = visible;
        mentorSidebar.classList.toggle('hidden', !visible);
        mentorBtnText.textContent = visible ? 'Ocultar Mentor' : 'Ver Mentor';
        toggleMentorBtn.classList.toggle('bg-primary/10', visible);
        toggleMentorBtn.classList.toggle('text-primary', visible);
        toggleMentorBtn.classList.toggle('border-primary/30', visible);
        
        // If hidden, stop talking
        if (!visible && mentorIframe.contentWindow) {
            mentorIframe.contentWindow.postMessage({ type: 'stop' }, '*');
        }
    };

    if (toggleMentorBtn) toggleMentorBtn.addEventListener('click', () => updateMentorVisibility(!isMentorVisible));
    if (closeMentorBtn) closeMentorBtn.addEventListener('click', () => updateMentorVisibility(false));

    if (!chatForm || !chatInput) return;

    let systemInstruction = "";
    const loadMentorConfig = async () => {
        try {
            const [rulesRes, skillsRes] = await Promise.all([
                fetch('/dashboard/assets/mentor/rules.md'),
                fetch('/dashboard/assets/mentor/skills.md')
            ]);
            systemInstruction = `${await rulesRes.text()}\n\n${await skillsRes.text()}`;
        } catch (e) {
            systemInstruction = "Eres un mentor de programación experto.";
        }
    };
    loadMentorConfig();

    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = chatInput.scrollHeight + 'px';
    });

    addChatBtn.addEventListener('click', async () => {
        const icon = addChatBtn.querySelector('.material-symbols-outlined');
        addChatBtn.disabled = true;
        if (icon) icon.classList.add('animate-spin');
        
        try {
            const user = await api.getUser();
            console.log('[CHAT] Creando conversación para usuario:', user.id);
            const newConv = await api.createConversation(user.id);
            console.log('[CHAT] Respuesta del servidor:', newConv);
            
            // PostgREST/Proxy might return the object or an array with the object
            const convData = Array.isArray(newConv) ? newConv[0] : newConv;
            
            if (convData && convData.id) {
                console.log('[CHAT] Navegando a nueva conversación:', convData.id);
                window.router.navigate('chat', { id: convData.id });
            } else {
                throw new Error('No se recibió el ID de la nueva conversación');
            }
        } catch (err) {
            console.error('[CHAT] Error al crear conversación:', err);
            await ui.alert({
                title: 'Error al crear chat',
                message: 'No pudimos iniciar una nueva sesión de mentoría. Por favor, intenta de nuevo.',
                type: 'danger'
            });
        } finally {
            addChatBtn.disabled = false;
            if (icon) icon.classList.remove('animate-spin');
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
            await ui.alert({
                title: 'Conversación no seleccionada',
                message: 'Para enviar un mensaje, primero debes seleccionar una sesión activa o crear una nueva.',
                type: 'warning'
            });
            return;
        }

        chatInput.value = '';
        chatInput.style.height = 'auto';
        chatInput.disabled = true;
        document.getElementById('send-btn').disabled = true;
        
        const messagesContainer = document.getElementById('chat-messages');
        const typingIndicator = document.getElementById('typing-indicator');

        // Render function helper (same as Chat template)
        const renderMarkdown = (text) => {
            if (window.marked) return marked.parse(text);
            return text;
        };

        // 1. Inyectar mensaje del usuario inmediatamente
        const userMsgHTML = `
            <div class="flex justify-end">
                <div class="max-w-[85%] bg-primary-container text-on-primary-container p-4 rounded-2xl rounded-tr-none shadow-sm animate-fade-in">
                    <div class="prose prose-sm max-w-none prose-p:leading-relaxed">
                        ${renderMarkdown(message)}
                    </div>
                    <p class="text-[9px] mt-2 font-bold uppercase opacity-50 text-right">Tú</p>
                </div>
            </div>
        `;
        
        // Si no había mensajes, limpiar el placeholder vacío
        if (messagesContainer.querySelector('.opacity-40')) {
            messagesContainer.innerHTML = '';
        }
        
        messagesContainer.insertAdjacentHTML('beforeend', userMsgHTML);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        if (typingIndicator) {
            typingIndicator.classList.remove('hidden');
            messagesContainer.appendChild(typingIndicator); // Asegurar que esté al final
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        // Reset de mood al enviar mensaje y activar modo "pensando"
        if (isMentorVisible && mentorIframe.contentWindow) {
            mentorIframe.contentWindow.postMessage({ type: 'mood', value: 'normal' }, '*');
            mentorIframe.contentWindow.postMessage({ type: 'thinking', value: true }, '*');
        }

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ systemInstruction, message, history: chatHistory })
            });

            if (!response.ok) throw new Error('Error IA');
            
            const data = await response.json();
            console.log('[CHAT] IA Response Data:', data);
            const aiText = data.text;
            console.log('[CHAT] AI Text:', aiText.substring(0, 50) + '...');
            
            modelIndicator.innerHTML = `
                <span class="w-1.5 h-1.5 rounded-full ${data.model.includes('Grok') ? 'bg-tertiary' : 'bg-primary'} animate-pulse"></span> 
                ${data.model}
            `;

            if (typingIndicator) typingIndicator.classList.add('hidden');
            
            // Desactivar modo "pensando"
            if (mentorIframe.contentWindow) {
                mentorIframe.contentWindow.postMessage({ type: 'thinking', value: false }, '*');
            }

            // Detección inteligente de mood y GESTO (usando Regex para evitar falsos positivos)
            const lowerAI = aiText.toLowerCase();
            const hasMatch = (words) => words.some(w => new RegExp(`\\b${w}\\b`, 'i').test(lowerAI));

            if (hasMatch(['❤️', 'excelente', 'felicidades', 'muy bien', 'genial', 'increíble'])) {
                window.setMentorMood('love');
                window.triggerGesture('Dance'); 
            } else if (hasMatch(['ojo', 'cuidado', 'atención', 'advertencia'])) {
                window.setMentorMood('alert');
                window.triggerGesture('No');
            } else if (hasMatch(['correcto', 'perfecto', 'exacto', 'sí', 'bien'])) {
                // Evitamos que "sintaxis" active el "sí"
                window.triggerGesture('Yes');
                window.setMentorMood('normal');
            } else if (hasMatch(['error', 'fallo', 'incorrecto', 'problema'])) {
                window.setMentorMood('error');
                window.triggerGesture('No');
            }

            // 2. Inyectar respuesta de la IA
            const aiMsgHTML = `
                <div class="flex justify-start">
                    <div class="max-w-[85%] bg-surface-container-highest border border-outline-variant text-on-surface p-4 rounded-2xl rounded-tl-none shadow-sm animate-fade-in">
                        <div class="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed">
                            ${renderMarkdown(aiText)}
                        </div>
                        <p class="text-[9px] mt-2 font-bold uppercase opacity-50 text-primary">Mentor Arquitecto</p>
                    </div>
                </div>
            `;
            messagesContainer.insertAdjacentHTML('beforeend', aiMsgHTML);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            if (isMentorVisible && mentorIframe.contentWindow) {
                const speechText = aiText.replace(/```[\s\S]*?```/g, ' [Revisa el bloque de código que he escrito] ')
                                         .replace(/[*#_`~]/g, '')
                                         .replace(/\n/g, ' ')
                                         .trim();
                
                console.log('[CHAT] Sending text to mentor iframe:', speechText.substring(0, 50) + '...');
                mentorIframe.contentWindow.postMessage({ type: 'speak', text: speechText }, '*');
            } else {
                console.log('Mentor not receiving (visible:', isMentorVisible, ')');
            }

            await api.saveChatMessage(user.id, finalActiveId, message, aiText);
            // Ya no navegamos, solo actualizamos la URL si es necesario (en este caso finalActiveId ya es correcto)
            // window.router.navigate('chat', { id: finalActiveId }, false);
        } catch (error) {
            console.error('Chat Error:', error);
            if (typingIndicator) typingIndicator.classList.add('hidden');
            
            // Activar mood de Error en el mentor
            window.setMentorMood('error');

            if (mentorIframe && mentorIframe.contentWindow) {
                mentorIframe.contentWindow.postMessage({ type: 'thinking', value: false }, '*');
            }
        } finally {
            chatInput.disabled = false;
            document.getElementById('send-btn').disabled = false;
            chatInput.focus();
        }
    });

    if (messagesContainer) messagesContainer.scrollTop = messagesContainer.scrollHeight;
    if (chatInput) chatInput.focus();
};
