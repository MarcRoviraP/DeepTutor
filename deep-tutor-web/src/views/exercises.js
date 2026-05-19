export const Exercises = (data) => {
    const { exercises } = data;
    console.log('[VIEW] Exercises received:', exercises ? exercises.length : 'UNDEFINED');
    
    if (!exercises || !Array.isArray(exercises)) {
        return `<div class="p-8 text-center"><p class="text-error font-bold">Error: No hay datos de ejercicios disponibles.</p></div>`;
    }

    const levels = ["Principiante", "Elemental", "Intermedio", "Avanzado", "Experto"];

    const topics = data.topics || [];
    const topicMap = topics.reduce((acc, t) => {
        acc[t.id] = t.nombre;
        return acc;
    }, {});

    // Group exercises by difficulty and then sub-group by topic
    const groupedByLevelAndTopic = levels.reduce((acc, level) => {
        const levelExercises = exercises.filter(ex => ex.difficulty === level);
        if (levelExercises.length > 0) {
            const topicGroups = levelExercises.reduce((tAcc, ex) => {
                const topicId = ex.topic_id || 'unassigned';
                const topicName = topicMap[topicId] || 'Otros Temas';
                if (!tAcc[topicName]) {
                    tAcc[topicName] = [];
                }
                tAcc[topicName].push(ex);
                return tAcc;
            }, {});
            acc[level] = topicGroups;
        } else {
            acc[level] = {};
        }
        return acc;
    }, {});

    const renderExerciseCard = (ex) => {
        const description = ex.description || 'No hay descripción disponible.';
        const formattedDescription = description.replace(/\n/g, '<br/>');
        
        // Find progress for this exercise
        const exProgress = (data.progress || []).find(p => p.ejer_id == ex.id);
        const estado = exProgress ? exProgress.estado : 0;
        
        // Define colors and icons based on status
        let statusColorClass = 'text-primary';
        let statusIcon = 'terminal';
        let cardBorderClass = 'border-outline-variant';
        
        if (estado === 1) {
            statusColorClass = 'text-[#ff9800]'; // Orange
            statusIcon = 'pending';
            cardBorderClass = 'border-[#ff9800]/50';
        } else if (estado === 2) {
            statusColorClass = 'text-[#4caf50]'; // Green
            statusIcon = 'check_circle';
            cardBorderClass = 'border-[#4caf50]/50 bg-[#4caf50]/5';
        }

        return `
        <div class="bg-surface-container border ${cardBorderClass} p-6 rounded-lg flex flex-col gap-4 hover:border-primary transition-all cursor-pointer group" onclick="router.navigate('editor', {id: '${ex.id}'})">
            <div class="flex justify-between items-start">
                <span class="material-symbols-outlined ${statusColorClass} text-3xl">${statusIcon}</span>
                <span class="px-2 py-1 bg-surface-container-high rounded text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">${ex.difficulty}</span>
            </div>
            <div>
                <h3 class="text-lg font-bold group-hover:text-primary transition-colors">${ex.title}</h3>
                <p class="text-sm text-on-surface-variant mt-2 line-clamp-3">${formattedDescription}</p>
            </div>
            <div class="mt-auto pt-4 flex items-center justify-between text-xs font-bold text-outline uppercase tracking-widest">
                <span>30 mins</span>
                <span class="flex items-center gap-1 group-hover:text-primary transition-colors">
                    ${estado === 2 ? 'Repasar Laboratorio' : (estado === 1 ? 'Continuar Laboratorio' : 'Empezar Laboratorio')} 
                    <span class="material-symbols-outlined text-sm">arrow_forward</span>
                </span>
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
            const levelGroups = groupedByLevelAndTopic[level];
            if (Object.keys(levelGroups).length === 0) return '';

            const totalCount = Object.values(levelGroups).reduce((sum, list) => sum + list.length, 0);

            return `
            <section class="flex flex-col gap-6">
                <div class="flex items-center gap-4">
                    <h3 class="text-2xl font-black text-primary">${level}</h3>
                    <div class="h-[1px] flex-grow bg-outline-variant opacity-30"></div>
                    <span class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">${totalCount} Ejercicios</span>
                </div>
                <div class="flex flex-col gap-8 pl-4 border-l border-outline-variant/20 ml-2">
                    ${Object.entries(levelGroups).map(([topicName, topicExercises]) => `
                        <div class="flex flex-col gap-4">
                            <div class="flex items-center gap-3">
                                <span class="material-symbols-outlined text-sm text-outline-variant">folder_open</span>
                                <h4 class="text-xs font-bold text-on-surface-variant uppercase tracking-[0.15em] opacity-80">${topicName}</h4>
                                <span class="text-[10px] px-2 py-0.5 bg-surface-container-highest rounded text-outline font-bold">${topicExercises.length}</span>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                ${topicExercises.map(renderExerciseCard).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>
            `;
        }).join('')}
    </div>
    `;
};
