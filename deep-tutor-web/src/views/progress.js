export const Progress = (data) => {
    const { progress } = data;
    
    return `
    <div class="max-w-4xl mx-auto flex flex-col gap-10 animate-fade-in">
        <header>
            <h2 class="text-2xl font-bold">Tu Progreso</h2>
            <p class="text-on-surface-variant">Vista detallada de tu camino de aprendizaje y dominio de habilidades.</p>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="bg-surface-container border border-outline-variant p-8 rounded-lg flex flex-col items-center gap-6">
                <h3 class="font-bold uppercase tracking-widest text-xs text-outline">Dominio General</h3>
                <div class="relative w-40 h-40">
                    <svg class="w-full h-full transform -rotate-90">
                        <circle cx="80" cy="80" r="70" stroke="currentColor" stroke-width="10" fill="transparent" class="text-surface-container-highest" />
                        <circle cx="80" cy="80" r="70" stroke="currentColor" stroke-width="10" fill="transparent" stroke-dasharray="439.8" stroke-dashoffset="${439.8 - (439.8 * progress.mastery / 100)}" class="text-primary transition-all duration-1000" />
                    </svg>
                    <div class="absolute inset-0 flex items-center justify-center">
                        <span class="text-3xl font-bold">${progress.mastery}%</span>
                    </div>
                </div>
            </div>

            <div class="flex flex-col gap-4">
                <h3 class="font-bold">Matriz de Habilidades</h3>
                <div class="bg-surface-container border border-outline-variant p-6 rounded-lg flex flex-col gap-6">
                    ${progress.breakdown.map(skill => `
                        <div class="flex flex-col gap-2">
                            <div class="flex justify-between text-[10px] font-bold uppercase tracking-widest text-outline">
                                <span>${skill.name}</span>
                                <span>${skill.percentage}%</span>
                            </div>
                            <div class="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                                <div class="bg-primary h-full" style="width: ${skill.percentage}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <section class="flex flex-col gap-4">
            <h3 class="font-bold">Hoja de Ruta de Aprendizaje</h3>
            <div class="flex flex-col gap-2">
                ${progress.modules.map(m => `
                    <div class="bg-surface-container border border-outline-variant p-4 rounded-lg flex items-center gap-6 ${m.status === 'locked' ? 'opacity-40' : ''}">
                        <div class="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center shrink-0">
                            <span class="material-symbols-outlined text-sm ${m.status === 'completed' ? 'text-primary' : ''}">
                                ${m.status === 'completed' ? 'check_circle' : m.status === 'active' ? 'pending' : 'lock'}
                            </span>
                        </div>
                        <div>
                            <p class="font-bold text-sm ${m.status === 'active' ? 'text-primary' : ''}">${m.name}</p>
                            <p class="text-xs text-on-surface-variant">${m.desc}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </section>
    </div>
    `;
};
