export const Exercises = (data) => {
    const { exercises } = data;
    
    return `
    <div class="flex flex-col gap-8 animate-fade-in">
        <header class="flex flex-col gap-2">
            <h2 class="text-3xl font-bold text-on-surface">Available Exercises</h2>
            <p class="text-on-surface-variant">Choose a topic and start practicing. Your mentor will help you if you get stuck.</p>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${exercises.map(ex => `
                <div class="bg-surface-container border border-outline-variant p-6 rounded-lg flex flex-col gap-4 hover:border-primary transition-all cursor-pointer group" onclick="router.navigate('editor', {id: '${ex.id}'})">
                    <div class="flex justify-between items-start">
                        <span class="material-symbols-outlined text-primary text-3xl">terminal</span>
                        <span class="px-2 py-1 bg-surface-container-high rounded text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">${ex.level}</span>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold group-hover:text-primary transition-colors">${ex.title}</h3>
                        <p class="text-sm text-on-surface-variant line-clamp-2">${ex.desc}</p>
                    </div>
                    <div class="mt-auto pt-4 flex items-center justify-between text-xs font-bold text-outline uppercase tracking-widest">
                        <span>30 mins</span>
                        <span class="flex items-center gap-1 group-hover:text-primary transition-colors">Start Lab <span class="material-symbols-outlined text-sm">arrow_forward</span></span>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
    `;
};
