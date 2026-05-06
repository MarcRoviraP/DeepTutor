export const Editor = (data) => {
    const { exercise } = data;
    
    return `
    <div class="h-full flex flex-col gap-6 animate-fade-in">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
                <span class="material-symbols-outlined text-primary">code</span>
                <h2 class="text-xl font-bold">${exercise ? exercise.title : 'Python Sandbox'}</h2>
            </div>
            <button class="bg-primary text-on-primary px-4 py-2 rounded font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2">
                <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">play_arrow</span> Run Code
            </button>
        </div>

        <div class="flex-1 flex overflow-hidden gap-6 min-h-0">
            <div class="flex-1 flex flex-col bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
                <div class="h-10 bg-surface-container border-b border-outline-variant flex items-center px-4 shrink-0">
                    <div class="flex items-center gap-2 text-xs font-mono text-primary">
                        <span class="material-symbols-outlined text-sm">description</span>
                        <span>${exercise ? exercise.id + '.py' : 'main.py'}</span>
                    </div>
                </div>
                <div class="flex-1 overflow-auto flex font-mono text-sm leading-relaxed">
                    <div class="w-12 bg-surface-container border-r border-outline-variant flex flex-col items-end py-4 pr-3 text-outline/30 select-none shrink-0">
                        ${Array.from({length: 15}, (_, i) => `<div>${i+1}</div>`).join('')}
                    </div>
                    <div class="p-4 whitespace-pre flex-1">
<span class="text-primary-container">import</span> pandas <span class="text-primary-container">as</span> pd
<span class="text-primary-container">import</span> numpy <span class="text-primary-container">as</span> np

<span class="text-primary-container">def</span> <span class="text-tertiary">analyze_data</span>(path):
    <span class="text-outline"># Task: ${exercise ? exercise.title : 'Loading data'}</span>
    df = pd.read_csv(path)
    
    <span class="text-outline"># Intentional error for analysis</span>
    result = df[<span class="text-tertiary">'NonExistent'</span>].sum()
    
    <span class="text-primary-container">return</span> result
                    </div>
                </div>
            </div>

            <div class="w-[340px] flex flex-col gap-6 shrink-0 overflow-y-auto">
                <div class="bg-surface-container border border-outline-variant p-6 rounded-lg flex flex-col gap-4">
                    <h3 class="font-bold text-error flex items-center gap-2">
                        <span class="material-symbols-outlined text-sm">report</span> Analysis Error
                    </h3>
                    <p class="text-xs font-mono text-on-surface-variant p-2 bg-surface-container-lowest rounded">KeyError: 'NonExistent'</p>
                    <p class="text-xs text-on-surface-variant leading-relaxed">The AI mentor detected a key error. You are trying to access a column that doesn't exist in the CSV structure.</p>
                    <button class="w-full bg-surface-container-high border border-outline-variant py-2 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-surface-container-highest transition-all">Fix with AI</button>
                </div>
            </div>
        </div>
    </div>
    `;
};
