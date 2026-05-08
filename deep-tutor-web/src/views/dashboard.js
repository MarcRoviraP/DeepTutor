export const Dashboard = (data) => {
    const { user, sessions } = data;
    
    return `
    <div class="flex flex-col gap-8 animate-fade-in">
        <section class="flex flex-col gap-2">
            <h2 class="text-3xl font-bold text-on-surface">Bienvenido de nuevo, ${user.name}</h2>
            <p class="text-on-surface-variant">Continúa tu camino para convertirte en un experto en Python.</p>
        </section>

        <section class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-surface-container border border-outline-variant p-6 rounded-lg">
                <span class="material-symbols-outlined text-primary mb-2">timer</span>
                <p class="text-2xl font-bold">${user.stats.studyTime}h</p>
                <p class="text-xs font-bold text-outline uppercase tracking-widest">Tiempo de Estudio</p>
            </div>
            <div class="bg-surface-container border border-outline-variant p-6 rounded-lg">
                <span class="material-symbols-outlined text-tertiary mb-2">task_alt</span>
                <p class="text-2xl font-bold">${user.stats.exercisesDone}</p>
                <p class="text-xs font-bold text-outline uppercase tracking-widest">Completado</p>
            </div>
            <div class="bg-surface-container border border-outline-variant p-6 rounded-lg">
                <span class="material-symbols-outlined text-primary mb-2">local_fire_department</span>
                <p class="text-2xl font-bold">${user.stats.streak}</p>
                <p class="text-xs font-bold text-outline uppercase tracking-widest">Racha de Días</p>
            </div>
            <div class="bg-surface-container border border-outline-variant p-6 rounded-lg">
                <span class="material-symbols-outlined text-tertiary mb-2">school</span>
                <p class="text-2xl font-bold">${user.stats.level}</p>
                <p class="text-xs font-bold text-outline uppercase tracking-widest">Nivel</p>
            </div>
        </section>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <section class="lg:col-span-2 flex flex-col gap-4">
                <h3 class="text-xl font-bold">Actividad Reciente</h3>
                <div class="bg-surface-container border border-outline-variant rounded-lg overflow-hidden">
                    ${sessions.map((session, index) => `
                        <div class="flex items-center justify-between p-4 ${index !== sessions.length - 1 ? 'border-b border-outline-variant' : ''} hover:bg-surface-container-high transition-colors cursor-pointer">
                            <div class="flex items-center gap-4">
                                <span class="material-symbols-outlined text-on-surface-variant">${session.type === 'exercise' ? 'terminal' : 'forum'}</span>
                                <div>
                                    <p class="font-bold">${session.title}</p>
                                    <p class="text-xs text-on-surface-variant">${session.date} • ${session.duration}</p>
                                </div>
                            </div>
                            <span class="material-symbols-outlined text-outline">chevron_right</span>
                        </div>
                    `).join('')}
                </div>
            </section>

            <section class="flex flex-col gap-4">
                <h3 class="text-xl font-bold">Ruta de Aprendizaje</h3>
                <div class="bg-surface-container border border-outline-variant p-6 rounded-lg flex flex-col gap-6">
                    <div>
                        <p class="text-xs font-bold text-outline uppercase tracking-widest mb-1">Objetivo Actual</p>
                        <p class="font-bold text-primary">Dominando Pandas</p>
                    </div>
                    <div class="flex flex-col gap-2">
                        <div class="flex justify-between text-xs font-bold">
                            <span>Progreso</span>
                            <span>75%</span>
                        </div>
                        <div class="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                            <div class="bg-primary h-full" style="width: 75%"></div>
                        </div>
                    </div>
                    <button class="w-full bg-primary text-on-primary py-2 rounded font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all">Reanudar Módulo</button>
                </div>
            </section>
        </div>
    </div>
    `;
};
