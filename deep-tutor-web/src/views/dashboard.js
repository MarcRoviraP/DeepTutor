export const Dashboard = (data) => {
    const { user, sessions, currentGoal } = data;
    
    // Fallback values for empty states
    const exercisesDone = user.stats?.exercisesDone || 0;
    const streak = user.stats?.streak || 0;
    const level = user.stats?.level || "Principiante";

    return `
    <div class="flex flex-col gap-8 animate-fade-in p-2 md:p-4">
        <!-- Bienvenida con efecto de profundidad -->
        <section class="flex flex-col gap-2 relative overflow-hidden p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-transparent border border-outline-variant/30">
            <div class="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <span class="material-symbols-outlined !text-[120px]">architecture</span>
            </div>
            <h2 class="text-4xl font-bold text-on-surface tracking-tight">Hola, ${user.nombre || user.name}</h2>
            <p class="text-on-surface-variant text-lg">Revisá tu progreso y continuá con tu aprendizaje técnico.</p>
        </section>

        <!-- Stats Grid con Glassmorphism -->
        <section class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="group bg-surface-container/40 backdrop-blur-md border border-outline-variant hover:border-tertiary/50 p-6 rounded-2xl transition-all duration-300">
                <div class="flex items-center justify-between mb-4">
                    <span class="material-symbols-outlined text-tertiary bg-tertiary/10 p-2 rounded-xl">task_alt</span>
                    <span class="text-[10px] font-bold text-outline uppercase tracking-tighter">Logros</span>
                </div>
                <p class="text-3xl font-bold tracking-tight">${exercisesDone}</p>
                <p class="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1 opacity-60 text-sm">Ejercicios</p>
            </div>
            <div class="group bg-surface-container/40 backdrop-blur-md border border-outline-variant hover:border-primary/50 p-6 rounded-2xl transition-all duration-300">
                <div class="flex items-center justify-between mb-4">
                    <span class="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl">local_fire_department</span>
                    <span class="text-[10px] font-bold text-outline uppercase tracking-tighter">Consistencia</span>
                </div>
                <p class="text-3xl font-bold tracking-tight">${streak}</p>
                <p class="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1 opacity-60 text-sm">Racha (Días)</p>
            </div>
            <div class="group bg-surface-container/40 backdrop-blur-md border border-outline-variant hover:border-tertiary/50 p-6 rounded-2xl transition-all duration-300">
                <div class="flex items-center justify-between mb-4">
                    <span class="material-symbols-outlined text-tertiary bg-tertiary/10 p-2 rounded-xl">school</span>
                    <span class="text-[10px] font-bold text-outline uppercase tracking-tighter">Rango</span>
                </div>
                <p class="text-3xl font-bold tracking-tight">${level}</p>
                <p class="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1 opacity-60 text-sm">Nivel Actual</p>
            </div>
        </section>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Actividad Real -->
            <section class="lg:col-span-2 flex flex-col gap-6">
                <div class="flex items-center justify-between">
                    <h3 class="text-xl font-bold tracking-tight flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary">history</span>
                        Actividad Reciente
                    </h3>
                    <button class="text-xs font-bold text-primary uppercase tracking-widest hover:underline">Ver todo</button>
                </div>
                
                <div class="bg-surface-container/20 border border-outline-variant rounded-2xl overflow-hidden backdrop-blur-sm">
                    ${sessions.length > 0 ? sessions.map((session, index) => `
                        <div class="group flex items-center justify-between p-5 ${index !== sessions.length - 1 ? 'border-b border-outline-variant/30' : ''} hover:bg-primary/5 transition-all cursor-pointer">
                            <div class="flex items-center gap-5">
                                <div class="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                    <span class="material-symbols-outlined text-on-surface-variant group-hover:text-primary">${session.type === 'exercise' ? 'terminal' : 'forum'}</span>
                                </div>
                                <div>
                                    <p class="font-bold text-on-surface group-hover:text-primary transition-colors">${session.title}</p>
                                    <p class="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">${session.date} • ${session.duration}</p>
                                </div>
                            </div>
                            <span class="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">chevron_right</span>
                        </div>
                    `).join('') : `
                        <div class="p-12 text-center flex flex-col items-center gap-4">
                            <span class="material-symbols-outlined !text-6xl text-outline-variant">inbox</span>
                            <p class="text-on-surface-variant italic">No hay actividad reciente. ¡Empezá hoy mismo!</p>
                        </div>
                    `}
                </div>
            </section>

            <!-- Ruta Dinámica -->
            <section class="flex flex-col gap-6">
                <h3 class="text-xl font-bold tracking-tight flex items-center gap-2">
                    <span class="material-symbols-outlined text-tertiary">map</span>
                    Ruta de Aprendizaje
                </h3>
                
                <div class="bg-surface-container/40 backdrop-blur-xl border border-outline-variant p-8 rounded-2xl flex flex-col gap-8 relative overflow-hidden shadow-xl shadow-black/20">
                    <!-- Decoración visual -->
                    <div class="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
                    
                    <div class="relative">
                        <p class="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Objetivo Actual</p>
                        <p class="text-2xl font-bold text-on-surface leading-tight">${currentGoal?.topic_name || "Comenzar Tutoría"}</p>
                        <p class="text-sm text-on-surface-variant mt-2">${currentGoal ? 'Seguí avanzando en este módulo para dominar la materia.' : 'Iniciá una conversación para definir tu ruta.'}</p>
                    </div>

                    <div class="flex flex-col gap-3">
                        <div class="flex justify-between items-end">
                            <span class="text-[10px] font-bold text-outline uppercase tracking-widest">Progreso</span>
                            <span class="text-lg font-black text-primary">${currentGoal?.score || 0}%</span>
                        </div>
                        <div class="h-3 bg-surface-container-highest rounded-full overflow-hidden border border-outline-variant/30">
                            <div class="bg-gradient-to-r from-primary to-primary-container h-full transition-all duration-1000 shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" style="width: ${currentGoal?.score || 0}%"></div>
                        </div>
                    </div>

                    <button onclick="window.location.hash='#/chat'" class="w-full bg-primary text-on-primary py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:shadow-lg hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0 transition-all duration-300">
                        ${currentGoal ? 'Reanudar Módulo' : 'Ir al Mentor'}
                    </button>
                </div>
                
                <!-- Card de errores comunes (Opcional/Extra) -->
                <div class="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl flex items-center gap-4 opacity-80 hover:opacity-100 transition-opacity">
                    <span class="material-symbols-outlined text-error">warning</span>
                    <div class="flex-1">
                        <p class="text-xs font-bold uppercase tracking-widest opacity-60">Área de mejora</p>
                        <p class="text-sm font-bold">Conceptos de Herencia</p>
                    </div>
                </div>
            </section>
        </div>
    </div>
    `;
};
