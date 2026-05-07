export const Editor = (data) => {
    const { exercise } = data;
    
    const formattedDescription = exercise ? exercise.description.replace(/\n/g, '<br/>') : 'Loading exercise details...';

    return `
    <div class="flex flex-col gap-8 animate-fade-in pb-12">
        <!-- Header & Top Description Section -->
        <header class="flex flex-col gap-6 bg-surface-container border border-outline-variant p-8 rounded-2xl shadow-xl">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <span class="material-symbols-outlined text-primary text-3xl">terminal</span>
                    </div>
                    <div>
                        <div class="flex items-center gap-3">
                            <h2 class="text-3xl font-black text-on-surface tracking-tight">${exercise ? exercise.title : 'Python Sandbox'}</h2>
                            <span class="px-3 py-1 bg-primary/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/30">${exercise ? exercise.difficulty : 'Medium'}</span>
                        </div>
                        <p class="text-on-surface-variant text-sm mt-1">Mentor: AI Tutor • Time: 30 mins</p>
                    </div>
                </div>
                <div class="flex gap-3">
                    <button class="bg-surface-container-high border border-outline-variant text-on-surface px-6 py-3 rounded-xl font-bold text-sm hover:bg-surface-container-highest transition-all flex items-center gap-2">
                        <span class="material-symbols-outlined text-sm">bookmark</span> Save
                    </button>
                    <button class="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-widest hover:shadow-[0_0_20px_rgba(192,193,255,0.4)] transition-all flex items-center gap-2">
                        <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">play_arrow</span> Run Code
                    </button>
                </div>
            </div>

            <div class="h-[1px] bg-outline-variant opacity-30"></div>

            <div class="prose prose-invert max-w-none">
                <h3 class="text-lg font-bold text-primary flex items-center gap-2">
                    <span class="material-symbols-outlined text-sm">description</span> Problem Statement
                </h3>
                <div class="text-on-surface-variant leading-relaxed text-base mt-4 bg-surface-container-lowest/50 p-6 rounded-xl border border-outline-variant/50">
                    ${formattedDescription}
                </div>
            </div>
        </header>

        <!-- Main Workspace Area -->
        <div class="flex flex-col lg:flex-row gap-8 items-start">
            
            <!-- Sticky Sidebar: Key Requirements / Summary -->
            <aside class="w-full lg:w-[320px] lg:sticky lg:top-8 flex flex-col gap-6 shrink-0">
                <div class="bg-surface-container border border-outline-variant p-6 rounded-2xl flex flex-col gap-4 shadow-lg">
                    <h3 class="font-bold text-primary flex items-center gap-2 uppercase tracking-widest text-xs">
                        <span class="material-symbols-outlined text-sm">list_alt</span> Requirements
                    </h3>
                    <ul class="flex flex-col gap-3">
                        <li class="flex items-start gap-3 text-sm text-on-surface-variant">
                            <span class="material-symbols-outlined text-success text-sm mt-1">check_circle</span>
                            <span>Correct time complexity O(n)</span>
                        </li>
                        <li class="flex items-start gap-3 text-sm text-on-surface-variant">
                            <span class="material-symbols-outlined text-success text-sm mt-1">check_circle</span>
                            <span>Handle empty input cases</span>
                        </li>
                        <li class="flex items-start gap-3 text-sm text-on-surface-variant">
                            <span class="material-symbols-outlined text-outline text-sm mt-1">radio_button_unchecked</span>
                            <span>Memory usage under 256MB</span>
                        </li>
                    </ul>
                </div>

                <div class="bg-surface-container border border-outline-variant p-6 rounded-2xl flex flex-col gap-4 shadow-lg border-l-4 border-l-error">
                    <h3 class="font-bold text-error flex items-center gap-2 uppercase tracking-widest text-xs">
                        <span class="material-symbols-outlined text-sm">report</span> AI Analysis
                    </h3>
                    <div class="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/30">
                        <p class="text-[10px] font-mono text-on-surface-variant opacity-70 mb-2">LAST_EXCEPTION:</p>
                        <p class="text-xs font-mono text-error">KeyError: 'NonExistent'</p>
                    </div>
                    <p class="text-xs text-on-surface-variant leading-relaxed">The AI mentor detected a key error. You are trying to access a column that doesn't exist in the CSV structure. Check the dataset schema.</p>
                    <button class="w-full bg-primary/10 border border-primary/20 text-primary py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary/20 transition-all">Ask Mentor for Help</button>
                </div>
            </aside>

            <!-- Code Editor Workspace -->
            <div class="flex-1 w-full flex flex-col bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-2xl min-h-[600px]">
                <div class="h-14 bg-surface-container border-b border-outline-variant flex items-center justify-between px-6 shrink-0">
                    <div class="flex items-center gap-3">
                        <div class="flex gap-1.5">
                            <div class="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                            <div class="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                            <div class="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                        </div>
                        <div class="h-4 w-[1px] bg-outline-variant mx-2"></div>
                        <div class="flex items-center gap-2 text-xs font-mono text-primary">
                            <span class="material-symbols-outlined text-base">code</span>
                            <span>${exercise ? exercise.id + '.py' : 'main.py'}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-4 text-[10px] font-bold text-outline-variant uppercase tracking-widest">
                        <span>Python 3.11</span>
                        <span class="material-symbols-outlined text-sm">settings</span>
                    </div>
                </div>
                
                <div class="flex-1 flex font-mono text-sm leading-relaxed">
                    <!-- Line Numbers -->
                    <div class="w-14 bg-surface-container/50 border-r border-outline-variant flex flex-col items-end py-6 pr-4 text-outline/30 select-none shrink-0">
                        ${Array.from({length: 25}, (_, i) => `<div>${i+1}</div>`).join('')}
                    </div>
                    
                    <!-- Code Area -->
                    <div class="p-6 whitespace-pre flex-1 overflow-x-auto selection:bg-primary/30">
<span class="text-[#c0c1ff]">import</span> pandas <span class="text-[#c0c1ff]">as</span> pd
<span class="text-[#c0c1ff]">import</span> numpy <span class="text-[#c0c1ff]">as</span> np

<span class="text-[#c0c1ff]">def</span> <span class="text-[#ffb783]">solve_exercise</span>(data):
    <span class="text-outline-variant italic"># ${exercise ? exercise.title : 'Solution code goes here'}</span>
    <span class="text-outline-variant italic"># Start coding below</span>
    
    df = pd.DataFrame(data)
    
    <span class="text-outline-variant italic"># Intentional error for the mentor to analyze</span>
    result = df[<span class="text-[#ffb783]">'target_column'</span>].mean()
    
    <span class="text-[#c0c1ff]">return</span> result

<span class="text-outline-variant italic"># --- Execution ---</span>
<span class="text-[#ffb783]">print</span>(solve_exercise({<span class="text-[#ffb783]">'a'</span>: [1, 2, 3]}))
                    </div>
                </div>

                <!-- Terminal Area (Bottom of Editor) -->
                <div class="h-40 bg-[#0d0d15] border-t border-outline-variant p-6 font-mono text-xs text-on-surface-variant overflow-y-auto">
                    <div class="flex items-center gap-2 text-success mb-2">
                        <span class="material-symbols-outlined text-sm">check_circle</span>
                        <span>Environment ready</span>
                    </div>
                    <div class="opacity-50">> python3 ${exercise ? exercise.id + '.py' : 'main.py'}</div>
                    <div class="text-error mt-1">Traceback (most recent call last):</div>
                    <div class="text-error">  File "solution.py", line 12, in solve_exercise</div>
                    <div class="text-error">KeyError: 'target_column'</div>
                    <div class="mt-2 animate-pulse text-primary">_</div>
                </div>
            </div>
        </div>
    </div>
    `;
};
