export const Chat = (data) => {
    const { history } = data;
    
    return `
    <div class="h-full flex flex-col animate-fade-in max-w-4xl mx-auto w-full">
        <header class="mb-6">
            <h2 class="text-2xl font-bold">AI Mentor</h2>
            <p class="text-xs font-bold text-outline uppercase tracking-widest">Active Session</p>
        </header>

        <div class="flex-1 overflow-y-auto flex flex-col gap-6 pr-2 mb-6">
            ${history.map(msg => `
                <div class="flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}">
                    <div class="max-w-[80%] ${msg.role === 'user' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container border border-outline-variant text-on-surface'} p-4 rounded-lg shadow-sm">
                        <p class="text-sm leading-relaxed">${msg.content}</p>
                        ${msg.code ? `
                            <div class="mt-4 bg-surface-container-lowest p-3 rounded font-mono text-[11px] text-primary-container overflow-x-auto">
                                ${msg.code}
                            </div>
                        ` : ''}
                        <p class="text-[9px] mt-2 font-bold uppercase opacity-50 text-right">${msg.role === 'user' ? 'You' : 'Mentor'} • ${msg.time}</p>
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="mt-auto relative">
            <input type="text" class="w-full bg-surface-container border border-outline-variant rounded-lg py-4 pl-4 pr-12 focus:outline-none focus:border-primary transition-colors text-sm" placeholder="Ask your mentor anything...">
            <button class="absolute right-2 top-1/2 -translate-y-1/2 text-primary p-2">
                <span class="material-symbols-outlined">send</span>
            </button>
        </div>
    </div>
    `;
};
