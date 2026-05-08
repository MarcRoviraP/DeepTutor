export const Exercises = (data) => {
    const { exercises } = data;
    console.log('[VIEW] Exercises received:', exercises ? exercises.length : 'UNDEFINED');
    
    if (!exercises || !Array.isArray(exercises)) {
        return `<div class="p-8 text-center"><p class="text-error font-bold">Error: No hay datos de ejercicios disponibles.</p></div>`;
    }

    const levels = ["Principiante", "Elemental", "Intermedio", "Avanzado", "Experto"];

    // Group exercises by difficulty
    const grouped = levels.reduce((acc, level) => {
        acc[level] = exercises.filter(ex => ex.difficulty === level);
        return acc;
    }, {});

    const renderExerciseCard = (ex) => {
        // Replace \n with <br/> to respect line breaks
        const description = ex.description || 'No hay descripción disponible.';
        const formattedDescription = description.replace(/\n/g, '<br/>');

        return `
        <div class="bg-surface-container border border-outline-variant p-6 rounded-lg flex flex-col gap-4 hover:border-primary transition-all cursor-pointer group" onclick="router.navigate('editor', {id: '${ex.id}'})">
            <div class="flex justify-between items-start">
                <span class="material-symbols-outlined text-primary text-3xl">terminal</span>
                <span class="px-2 py-1 bg-surface-container-high rounded text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">${ex.difficulty}</span>
            </div>
            <div>
                <h3 class="text-lg font-bold group-hover:text-primary transition-colors">${ex.title}</h3>
                <p class="text-sm text-on-surface-variant mt-2 line-clamp-3">${formattedDescription}</p>
            </div>
            <div class="mt-auto pt-4 flex items-center justify-between text-xs font-bold text-outline uppercase tracking-widest">
                <span>30 mins</span>
                <span class="flex items-center gap-1 group-hover:text-primary transition-colors">Empezar Laboratorio <span class="material-symbols-outlined text-sm">arrow_forward</span></span>
            </div>
        </div>
        `;
    };

    return `
    <div class="flex flex-col gap-12 animate-fade-in pb-12">
        <header class="flex flex-col gap-2">
            <h2 class="text-4xl font-black text-on-surface tracking-tight">Ejercicios Disponibles</h2>
            <p class="text-on-surface-variant text-lg">Desafíate a ti mismo y mejora tus habilidades de programación. Tu mentor IA está listo para ayudarte.</p>
        </header>

        ${exercises.length === 0 ? `
            <div class="flex flex-col items-center justify-center py-20 bg-surface-container rounded-xl border border-dashed border-outline-variant">
                <span class="material-symbols-outlined text-6xl text-outline-variant mb-4">inventory_2</span>
                <p class="text-on-surface-variant font-bold">No hay ejercicios disponibles en este momento.</p>
                <p class="text-on-surface-variant text-sm">Por favor, vuelve más tarde o contacta con tu instructor.</p>
            </div>
        ` : levels.map(level => {
            const levelExercises = grouped[level];
            if (levelExercises.length === 0) return '';

            return `
            <section class="flex flex-col gap-6">
                <div class="flex items-center gap-4">
                    <h3 class="text-2xl font-bold text-primary">${level}</h3>
                    <div class="h-[1px] flex-grow bg-outline-variant opacity-30"></div>
                    <span class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">${levelExercises.length} Ejercicios</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${levelExercises.map(renderExerciseCard).join('')}
                </div>
            </section>
            `;
        }).join('')}
    </div>
    `;
};
