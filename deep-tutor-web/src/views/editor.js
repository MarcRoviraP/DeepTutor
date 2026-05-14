import { api } from "../api.js";

export const Editor = (data) => {
    const { exercise } = data;
    
    const formattedDescription = exercise ? exercise.description.replace(/\n/g, '<br/>') : 'Cargando detalles del ejercicio...';
    const problemName = exercise ? exercise.title.replace(/\s+/g, '_') : 'Solucion';

    // Parsear ejemplos si existen
    let examplesHTML = '';
    if (exercise && exercise.examples) {
        try {
            const examples = typeof exercise.examples === 'string' ? JSON.parse(exercise.examples) : exercise.examples;
            examplesHTML = `
                <div class="mt-8 flex flex-col gap-4">
                    <h4 class="text-sm font-bold text-primary flex items-center gap-2 uppercase tracking-widest">
                        Casos de Prueba
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${examples.map((ex, i) => `
                            <div class="flex flex-col gap-3 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm">
                                <p class="text-[10px] font-black text-outline uppercase tracking-widest">Ejemplo ${i + 1}</p>
                                <div class="space-y-3">
                                    <div>
                                        <p class="text-[10px] text-on-surface-variant mb-1 uppercase tracking-widest font-bold opacity-60">Entrada</p>
                                        <pre class="bg-black/40 p-3 rounded-lg text-[11px] font-mono text-on-surface border border-white/5 whitespace-pre-wrap">${ex.Entrada || ex.input || 'N/A'}</pre>
                                    </div>
                                    <div>
                                        <p class="text-[10px] text-on-surface-variant mb-1 uppercase tracking-widest font-bold opacity-60">Salida</p>
                                        <pre class="bg-black/40 p-3 rounded-lg text-[11px] font-mono text-success border border-white/5 whitespace-pre-wrap">${ex.Salida || ex.output || 'N/A'}</pre>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } catch (e) {
            console.error('Error parsing examples:', e);
        }
    }

    // Formatear requisitos de la barra lateral
    const requirementsList = exercise && exercise.requirements 
        ? exercise.requirements.split('\n').map(req => `
            <li class="flex items-start gap-3 text-sm text-on-surface-variant">
                <span class="material-symbols-outlined text-primary text-sm mt-1" style="font-variation-settings: 'FILL' 1;">speed</span>
                <span class="font-mono text-xs">${req}</span>
            </li>
        `).join('')
        : `
            <li class="flex items-start gap-3 text-sm text-on-surface-variant">
                <span class="material-symbols-outlined text-outline text-sm mt-1">radio_button_unchecked</span>
                <span>Límites estándar: 1.0s / 256M</span>
            </li>
        `;

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
                            <span class="px-3 py-1 bg-primary/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/30">${exercise ? exercise.difficulty : 'Principiante'}</span>
                        </div>
                        <p class="text-on-surface-variant text-sm mt-1">Mentor: Tutor IA • Tiempo Estimado: 30 mins</p>
                    </div>
                </div>
                <div class="flex gap-3">
                    <button class="bg-surface-container-high border border-outline-variant text-on-surface px-6 py-3 rounded-xl font-bold text-sm hover:bg-surface-container-highest transition-all flex items-center gap-2">
                        <span class="material-symbols-outlined text-sm">bookmark</span> Guardar
                    </button>
                </div>
            </div>

            <div class="h-[1px] bg-outline-variant opacity-30"></div>

            <div class="flex flex-col gap-6">
                <div class="prose prose-invert max-w-none">
                    <h3 class="text-lg font-bold text-primary flex items-center gap-2">
                        <span class="material-symbols-outlined text-sm">description</span> Enunciado del Problema
                    </h3>
                    <div class="text-on-surface-variant leading-relaxed text-base mt-4 bg-surface-container-lowest/50 p-6 rounded-xl border border-outline-variant/50">
                        ${formattedDescription}
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-surface-container-lowest/30 p-5 rounded-xl border border-outline-variant/30">
                        <h4 class="text-xs font-bold text-on-surface flex items-center gap-2 uppercase tracking-widest mb-3">
                            <span class="material-symbols-outlined text-sm text-primary">input</span> Formato de Entrada
                        </h4>
                        <p class="text-sm text-on-surface-variant leading-relaxed">${exercise?.entrance || 'No especificado'}</p>
                    </div>
                    <div class="bg-surface-container-lowest/30 p-5 rounded-xl border border-outline-variant/30">
                        <h4 class="text-xs font-bold text-on-surface flex items-center gap-2 uppercase tracking-widest mb-3">
                            <span class="material-symbols-outlined text-sm text-success">output</span> Formato de Salida
                        </h4>
                        <p class="text-sm text-on-surface-variant leading-relaxed">${exercise?.exit || 'No especificado'}</p>
                    </div>
                </div>

                ${examplesHTML}
            </div>
        </header>

        <!-- Main Workspace Area -->
        <div class="flex flex-col lg:flex-row gap-8 items-start">
            
            <!-- Sticky Sidebar: Key Requirements / Summary -->
            <aside class="w-full lg:w-[320px] lg:sticky lg:top-8 flex flex-col gap-6 shrink-0">
                <div class="bg-surface-container border border-outline-variant p-6 rounded-2xl flex flex-col gap-4 shadow-lg">
                    <h3 class="font-bold text-primary flex items-center gap-2 uppercase tracking-widest text-xs">
                        <span class="material-symbols-outlined text-sm">inventory</span> Límites Técnicos
                    </h3>
                    <ul class="flex flex-col gap-3">
                        ${requirementsList}
                    </ul>
                </div>

                <div class="bg-surface-container border border-outline-variant p-6 rounded-2xl flex flex-col gap-4 shadow-lg border-l-4 border-l-error">
                    <h3 class="font-bold text-error flex items-center gap-2 uppercase tracking-widest text-xs">
                        <span class="material-symbols-outlined text-sm">report</span> Análisis de IA
                    </h3>
                    <div class="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/30">
                        <p class="text-[10px] font-mono text-on-surface-variant opacity-70 mb-2">ÚLTIMA_EXCEPCIÓN:</p>
                        <p class="text-xs font-mono text-error">N/A</p>
                    </div>
                    <p class="text-xs text-on-surface-variant leading-relaxed">El mentor IA está listo para analizar tu código. Pulsa "Ejecutar" para ver resultados o pide una revisión.</p>
                    <button class="w-full bg-primary/10 border border-primary/20 text-primary py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary/20 transition-all">Pedir Ayuda al Mentor</button>
                </div>
            </aside>

            <!-- Code Editor Workspace -->
            <div class="flex-1 w-full flex flex-col bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-2xl min-h-[700px]">
                <!-- Editor Toolbar -->
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
                            <span id="filename-display">${problemName}.py</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-4">
                        <div class="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant px-3 py-1.5 rounded-lg">
                            <span class="material-symbols-outlined text-sm text-outline">language</span>
                            <select id="language-selector" class="bg-[#0d0d15] border-none text-[10px] font-bold text-on-surface focus:ring-0 cursor-pointer uppercase tracking-widest">
                                <option value="python">Python</option>
                                <option value="lua">Lua</option>
                                <option value="java">Java</option>
                            </select>
                        </div>
                        
                        <div class="flex items-center gap-2">
                            <button id="reset-exercise-btn" class="flex items-center gap-2 bg-error/10 border border-error/20 text-error px-3 py-1.5 rounded-lg hover:bg-error/20 transition-all group" title="Restablecer ejercicio">
                                <span class="material-symbols-outlined text-sm group-hover:rotate-[-45deg] transition-transform">restart_alt</span>
                                <span class="text-[10px] font-bold uppercase tracking-widest">Restablecer</span>
                            </button>

                            <button id="run-code-btn" class="flex items-center gap-2 bg-surface-container-high border border-outline-variant text-on-surface px-4 py-1.5 rounded-lg hover:bg-surface-container-highest transition-all group" title="Ejecutar código">
                                <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">play_arrow</span>
                                <span class="text-[10px] font-bold uppercase tracking-widest">Ejecutar Código</span>
                            </button>

                            <button id="submit-solution-btn" class="flex items-center gap-2 bg-primary text-on-primary px-4 py-1.5 rounded-lg hover:shadow-[0_0_15px_rgba(192,193,255,0.3)] transition-all group" title="Enviar solución">
                                <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">send</span>
                                <span class="text-[10px] font-bold uppercase tracking-widest">Enviar Solución</span>
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Monaco Editor Container -->
                <div id="monaco-editor-container" class="flex-1 w-full" style="min-height: 500px;"></div>

                <!-- Terminal Area (Bottom of Editor) -->
                <div class="h-64 bg-[#0d0d15] border-t border-outline-variant flex">
                    <!-- Stdin Panel -->
                    <div class="w-1/4 border-r border-white/5 flex flex-col bg-white/[0.01]">
                        <div class="flex items-center gap-2 px-6 py-3 border-b border-white/5 bg-white/2">
                            <span class="material-symbols-outlined text-sm text-outline-variant">keyboard</span>
                            <span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Entrada (stdin)</span>
                        </div>
                        <textarea id="stdin-input" 
                            class="flex-1 bg-transparent p-4 font-mono text-xs text-on-surface focus:outline-none resize-none placeholder:text-outline-variant/30" 
                            placeholder="Ej: 10\nHola Mundo\n..."></textarea>
                    </div>

                    <!-- Console Panel -->
                    <div class="flex-1 flex flex-col">
                        <div class="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-white/2">
                            <div class="flex items-center gap-2">
                                <span class="material-symbols-outlined text-sm text-outline-variant">terminal</span>
                                <span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Salida de Consola</span>
                            </div>
                            <button id="clear-console-btn" class="text-[10px] font-bold text-outline-variant hover:text-on-surface uppercase tracking-widest flex items-center gap-1 transition-colors">
                                <span class="material-symbols-outlined text-xs">delete</span> Limpiar
                            </button>
                        </div>
                        <div id="console-output" class="flex-1 p-6 font-mono text-xs text-on-surface-variant overflow-y-auto leading-relaxed">
                            <div class="flex items-center gap-2 text-success/50 mb-2 italic">
                                <span class="material-symbols-outlined text-sm">info</span>
                                <span>La salida aparecerá aquí después de ejecutar...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
};

// Language configuration mapping
const LANGUAGE_CONFIG = {
    python: { extension: '.py', monaco: 'python', defaultCode: 'def solve():\n    # Escribe tu código aquí\n    pass\n\nif __name__ == "__main__":\n    solve()' },
    lua: { extension: '.lua', monaco: 'lua', defaultCode: 'function solve()\n    -- Escribe tu código aquí\nend\n\nsolve()' },
    java: { extension: '.java', monaco: 'java', defaultCode: 'public class Main {\n    public static void main(String[] args) {\n        // Escribe tu código aquí\n    }\n}' }
};

window.initEditor = (exercise) => {
    const container = document.getElementById('monaco-editor-container');
    const langSelector = document.getElementById('language-selector');
    const filenameDisplay = document.getElementById('filename-display');
    const problemName = exercise ? exercise.title.replace(/\s+/g, '_') : 'Solucion';

    if (!container) return;

    // Fix for "No suggestions" - Configure Workers from CDN correctly
    window.MonacoEnvironment = {
        getWorkerUrl: function (workerId, label) {
            const getPath = (file) => `https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/language/${file}`;
            
            if (label === 'json') return `data:text/javascript;charset=utf-8,${encodeURIComponent(`importScripts('${getPath('json/json.worker.js')}');`)}`;
            if (label === 'css' || label === 'scss' || label === 'less') return `data:text/javascript;charset=utf-8,${encodeURIComponent(`importScripts('${getPath('css/css.worker.js')}');`)}`;
            if (label === 'html' || label === 'handlebars' || label === 'razor') return `data:text/javascript;charset=utf-8,${encodeURIComponent(`importScripts('${getPath('html/html.worker.js')}');`)}`;
            if (label === 'typescript' || label === 'javascript') return `data:text/javascript;charset=utf-8,${encodeURIComponent(`importScripts('${getPath('typescript/ts.worker.js')}');`)}`;
            
            return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
                self.MonacoEnvironment = {
                    baseUrl: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/'
                };
                importScripts('https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/base/worker/workerMain.js');`
            )}`;
        }
    };

    // Load Monaco
    require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' }});

    require(['vs/editor/editor.main'], function() {
        // Initialize Editor
        const editor = monaco.editor.create(container, {
            value: exercise?.initial_code || LANGUAGE_CONFIG.python.defaultCode,
            language: 'python',
            theme: 'vs-dark',
            automaticLayout: true,
            fontFamily: 'JetBrains Mono',
            fontSize: 14,
            lineHeight: 1.6,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            roundedSelection: true,
            padding: { top: 20, bottom: 20 },
            scrollbar: {
                vertical: 'hidden',
                horizontal: 'hidden'
            },
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
            renderLineHighlight: 'all',
            // Suggestions config
            suggestOnTriggerCharacters: true,
            quickSuggestions: {
                other: true,
                comments: true,
                strings: true
            },
            acceptSuggestionOnEnter: 'on',
            // Fix for height issue
            suggest: {
                showIcons: true,
                maxVisibleSuggestions: 7,
                filterGraceful: true,
                snippetsPreventQuickSuggestions: false
            },
            suggestFontSize: 12,
            suggestLineHeight: 22,
            // CLAVE: Evita que el menú se corte por los bordes del IDE
            fixedOverflowWidgets: true
        });

        // Store editor instance globally if needed
        window.currentEditor = editor;

        // Language change handler
        langSelector.addEventListener('change', (e) => {
            const lang = e.target.value;
            const config = LANGUAGE_CONFIG[lang];
            
            // Update Monaco language
            monaco.editor.setModelLanguage(editor.getModel(), config.monaco);
            
            // Update Filename
            filenameDisplay.textContent = `${problemName}${config.extension}`;
            
            // Update default code if empty or just containing the other lang's default
            const currentVal = editor.getValue();
            const isAnyDefault = Object.values(LANGUAGE_CONFIG).some(c => c.defaultCode === currentVal);
            if (!currentVal || isAnyDefault) {
                editor.setValue(config.defaultCode);
            }
        });

        // Reset exercise handler
        const resetBtn = document.getElementById('reset-exercise-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', async () => {
                const currentLang = langSelector.value;
                const config = LANGUAGE_CONFIG[currentLang];
                
                const confirmed = await ui.confirm({
                    title: '¿Restablecer ejercicio?',
                    message: 'Se perderán todos tus cambios actuales y el código volverá a su estado inicial. Esta acción no se puede deshacer.',
                    type: 'warning',
                    confirmText: 'Sí, restablecer',
                    cancelText: 'No, cancelar'
                });

                if (confirmed) {
                    editor.setValue(config.defaultCode);
                    console.log(`[EDITOR] Exercise reset to default for ${currentLang}`);
                }
            });
        }

        // Utility to clean traceback paths
        const cleanTraceback = (text) => {
            if (!text || typeof text !== 'string') return text;
            const currentLang = langSelector.value;
            const config = LANGUAGE_CONFIG[currentLang];
            const virtualName = `${problemName}${config.extension}`;
            // Reemplaza rutas de /tmp/.../script.py con el nombre del ejercicio
            return text.replace(/File\s+"\/tmp\/[^"]+\/script\.\w+"/g, `File "${virtualName}"`);
        };

        // Run code handler
        const runBtn = document.getElementById('run-code-btn');
        const consoleOutput = document.getElementById('console-output');
        
        if (runBtn) {
            runBtn.addEventListener('click', async () => {
                const code = editor.getValue();
                const language = langSelector.value;
                const stdin = document.getElementById('stdin-input')?.value || '';
                
                // Visual feedback
                runBtn.disabled = true;
                const originalContent = runBtn.innerHTML;
                runBtn.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">sync</span> <span class="text-[10px] font-bold uppercase tracking-widest">Ejecutando...</span>';
                
                // Clear console and show loading
                consoleOutput.innerHTML = '<div class="flex items-center gap-2 text-primary animate-pulse"><span class="material-symbols-outlined text-sm">hourglass_empty</span> <span>Ejecutando código en servidor seguro...</span></div>';

                try {
                    const result = await api.executeCode(code, language, stdin);
                    console.log('[EDITOR] Execution result:', result);
                    
                    if (result.status === 'success') {
                        let outputHTML = '';
                        if (result.stdout) {
                            outputHTML += `<div class="text-on-surface mb-2 whitespace-pre-wrap font-mono">${cleanTraceback(result.stdout)}</div>`;
                        }
                        if (result.stderr) {
                            outputHTML += `<div class="text-error mb-2 whitespace-pre-wrap font-mono">${cleanTraceback(result.stderr)}</div>`;
                        }
                        if (!result.stdout && !result.stderr) {
                            outputHTML += `<div class="text-on-surface-variant italic">El programa terminó sin salida.</div>`;
                        }
                        
                        outputHTML += `<div class="mt-4 pt-4 border-t border-white/5 text-[10px] font-bold uppercase tracking-widest text-outline-variant flex items-center gap-4">
                            <span class="flex items-center gap-1"><span class="material-symbols-outlined text-xs text-success" style="font-variation-settings: 'FILL' 1;">check_circle</span> Exit Code: ${result.exit_code}</span>
                            <span class="flex items-center gap-1"><span class="material-symbols-outlined text-xs text-primary" style="font-variation-settings: 'FILL' 1;">security</span> Sandboxed: ${result.sandboxed}</span>
                        </div>`;
                        
                        consoleOutput.innerHTML = outputHTML;
                    } else {
                        console.error('[EDITOR] Execution failed:', result);
                        const rawError = result.details || result.stderr || result.message || result.error || 'Error desconocido al ejecutar el código.';
                        const errorMessage = cleanTraceback(rawError);
                        consoleOutput.innerHTML = `
                        <div class="text-error flex flex-col gap-2">
                            <div class="flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]">
                                <span class="material-symbols-outlined text-sm">error</span> Error de Ejecución
                            </div>
                            <div class="bg-error/10 p-4 rounded-lg border border-error/20 whitespace-pre-wrap font-mono text-xs">${errorMessage}</div>
                            ${result.exit_code !== undefined ? `<div class="text-[9px] uppercase tracking-widest opacity-50 px-1">Exit Code: ${result.exit_code}</div>` : ''}
                        </div>`;
                    }
                } catch (error) {
                    console.error('[EDITOR] Critical error connecting to server:', error);
                    consoleOutput.innerHTML = `<div class="text-error">Error al conectar con el servidor: ${error.message}</div>`;
                } finally {
                    runBtn.disabled = false;
                    runBtn.innerHTML = originalContent;
                }
            });
        }

        // Submit solution handler
        const submitBtn = document.getElementById('submit-solution-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', async () => {
                const code = editor.getValue();
                const language = langSelector.value;
                
                let testCases = [];
                try {
                    testCases = typeof exercise.testCases === 'string' ? JSON.parse(exercise.testCases) : (exercise.testCases || []);
                } catch (e) {
                    console.error('[EDITOR] Error parsing test cases:', e);
                }

                if (testCases.length === 0) {
                    consoleOutput.innerHTML = '<div class="text-error">No hay casos de prueba definidos para este ejercicio.</div>';
                    return;
                }

                // Visual feedback
                submitBtn.disabled = true;
                const originalContent = submitBtn.innerHTML;
                submitBtn.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">sync</span> <span class="text-[10px] font-bold uppercase tracking-widest">Enviando...</span>';
                
                consoleOutput.innerHTML = '<div class="flex flex-col gap-2"><div class="flex items-center gap-2 text-primary animate-pulse"><span class="material-symbols-outlined text-sm">hourglass_empty</span> <span>Evaluando solución con casos de prueba...</span></div></div>';

                let passedCount = 0;
                let resultsHTML = '<div class="flex flex-col gap-4">';

                try {
                    for (let i = 0; i < testCases.length; i++) {
                        const tc = testCases[i];
                        const input = tc.Entrada || tc.input || '';
                        const expectedOutput = (tc.Salida || tc.output || '').toString().trim();
                        
                        consoleOutput.innerHTML = `<div class="flex flex-col gap-2"><div class="flex items-center gap-2 text-primary animate-pulse"><span class="material-symbols-outlined text-sm">hourglass_empty</span> <span>Evaluando caso ${i + 1}/${testCases.length}...</span></div></div>`;

                        const result = await api.executeCode(code, language, input);
                        
                        const actualOutput = (result.stdout || '').toString().trim();
                        const isCorrect = actualOutput === expectedOutput && result.status === 'success';

                        if (isCorrect) passedCount++;

                        resultsHTML += `
                            <div class="bg-surface-container-lowest/50 p-4 rounded-xl border ${isCorrect ? 'border-success/30' : 'border-error/30'}">
                                <div class="flex items-center justify-between mb-3">
                                    <span class="text-[10px] font-bold uppercase tracking-widest ${isCorrect ? 'text-success' : 'text-error'} flex items-center gap-1">
                                        <span class="material-symbols-outlined text-xs">${isCorrect ? 'check_circle' : 'cancel'}</span>
                                        Caso de Prueba ${i + 1}
                                    </span>
                                    <span class="text-[10px] px-2 py-0.5 rounded-full ${isCorrect ? 'bg-success/10 text-success' : 'bg-error/10 text-error'} font-bold">
                                        ${isCorrect ? 'PASADO' : 'FALLADO'}
                                    </span>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
                                    <div>
                                        <p class="text-outline-variant uppercase text-[9px] font-bold mb-1">Esperado</p>
                                        <pre class="bg-black/20 p-2 rounded border border-white/5 font-mono">${expectedOutput || '(vacío)'}</pre>
                                    </div>
                                    <div>
                                        <p class="text-outline-variant uppercase text-[9px] font-bold mb-1">Obtenido</p>
                                        <pre class="bg-black/20 p-2 rounded border border-white/5 font-mono ${isCorrect ? 'text-success' : 'text-error'}">${actualOutput || (result.stderr ? 'ERROR' : '(vacío)')}</pre>
                                    </div>
                                </div>
                                ${result.stderr ? `<div class="mt-2 text-error font-mono text-[10px] bg-error/5 p-2 rounded border border-error/10">${cleanTraceback(result.stderr)}</div>` : ''}
                            </div>
                        `;
                    }

                    const allPassed = passedCount === testCases.length;
                    resultsHTML = `
                        <div class="mb-6 p-4 rounded-2xl ${allPassed ? 'bg-success/10 border border-success/30' : 'bg-surface-container-high border border-outline-variant'} flex items-center justify-between shadow-lg">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-xl ${allPassed ? 'bg-success/20' : 'bg-primary/20'} flex items-center justify-center border ${allPassed ? 'border-success/30' : 'border-primary/30'}">
                                    <span class="material-symbols-outlined ${allPassed ? 'text-success' : 'text-primary'} text-3xl">${allPassed ? 'workspace_premium' : 'analytics'}</span>
                                </div>
                                <div>
                                    <h4 class="text-lg font-bold ${allPassed ? 'text-success' : 'text-on-surface'}">${allPassed ? '¡Excelente Trabajo!' : 'Resultados de Evaluación'}</h4>
                                    <p class="text-xs text-on-surface-variant">Has superado ${passedCount} de ${testCases.length} casos de prueba.</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="text-2xl font-black ${allPassed ? 'text-success' : 'text-primary'}">${Math.round((passedCount / testCases.length) * 100)}%</div>
                                <div class="text-[9px] font-bold text-outline-variant uppercase tracking-widest">Puntuación</div>
                            </div>
                        </div>
                    ` + resultsHTML + '</div>';

                    consoleOutput.innerHTML = resultsHTML;
                    
                    // --- SAVE PROGRESS TO DB ---
                    const user = await api.getUser();
                    const estado = allPassed ? 2 : 1; // 2: correcto, 1: a medias
                    if (user && user.id && exercise && exercise.id) {
                        console.log(`[EDITOR] Saving progress for user ${user.id}, exercise ${exercise.id}, status ${estado}`);
                        await api.saveExerciseProgress(user.id, exercise.id, code, estado);
                    }

                } catch (error) {
                    console.error('[EDITOR] Error evaluating solution:', error);
                    consoleOutput.innerHTML = `<div class="text-error">Error al evaluar la solución: ${error.message}</div>`;
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalContent;
                }
            });
        }

        // Clear console handler
        const clearBtn = document.getElementById('clear-console-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                consoleOutput.innerHTML = `<div class="flex items-center gap-2 text-success/50 mb-2 italic">
                    <span class="material-symbols-outlined text-sm">info</span>
                    <span>Consola limpiada. La salida aparecerá aquí después de ejecutar...</span>
                </div>`;
            });
        }

        // Set initial filename based on default selection
        const initialLang = langSelector.value;
        filenameDisplay.textContent = `${problemName}${LANGUAGE_CONFIG[initialLang].extension}`;

        // Register Providers
        registerPythonProviders();
        registerJavaProviders();
    });
};

const registerPythonProviders = () => {
    // Only register once
    if (window.pythonProvidersRegistered) return;
    window.pythonProvidersRegistered = true;

    const keywords = ['False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield'];
    const builtins = ['abs', 'all', 'any', 'ascii', 'bin', 'bool', 'breakpoint', 'bytearray', 'bytes', 'callable', 'chr', 'classmethod', 'compile', 'complex', 'delattr', 'dict', 'dir', 'divmod', 'enumerate', 'eval', 'exec', 'filter', 'float', 'format', 'frozenset', 'getattr', 'globals', 'hasattr', 'hash', 'help', 'hex', 'id', 'input', 'int', 'isinstance', 'issubclass', 'iter', 'len', 'list', 'locals', 'map', 'max', 'memoryview', 'min', 'next', 'object', 'oct', 'open', 'ord', 'pow', 'print', 'property', 'range', 'repr', 'reversed', 'round', 'set', 'setattr', 'slice', 'sorted', 'staticmethod', 'str', 'sum', 'super', 'tuple', 'type', 'vars', 'zip'];

    monaco.languages.registerCompletionItemProvider('python', {
        provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position);
            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn
            };

            const text = model.getValue();
            
            // 1. Encontrar funciones definidas por el usuario (def nombre_funcion)
            const userFunctions = [...text.matchAll(/def\s+([a-zA-Z_][a-zA-Z0-9_]*)/g)].map(m => m[1]);
            
            // 2. Encontrar variables definidas por el usuario (variable = ...)
            const userVariables = [...text.matchAll(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*=/g)].map(m => m[1]);
            
            // Eliminar duplicados y filtrar la palabra que se está escribiendo actualmente
            const uniqueFunctions = [...new Set(userFunctions)].filter(f => f !== word.word);
            const uniqueVariables = [...new Set(userVariables)].filter(v => v !== word.word);

            const suggestions = [
                ...keywords.map(k => ({
                    label: k,
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: k,
                    range: range
                })),
                ...builtins.map(b => ({
                    label: b,
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: b + '(${1})',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range: range,
                    detail: 'Built-in function'
                })),
                ...uniqueFunctions.map(f => ({
                    label: f,
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: f + '(${1})',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range: range,
                    detail: 'User defined function'
                })),
                ...uniqueVariables.map(v => ({
                    label: v,
                    kind: monaco.languages.CompletionItemKind.Variable,
                    insertText: v,
                    range: range,
                    detail: 'User defined variable'
                })),
                {
                    label: 'def',
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: 'def ${1:function_name}(${2:args}):\n\t${3:pass}',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range: range,
                    detail: 'Function definition'
                },
                {
                    label: 'ifmain',
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: 'if __name__ == "__main__":\n\t${1:main()}',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range: range,
                    detail: 'Main block'
                }
            ];

            return { suggestions: suggestions };
        }
    });
};

const registerJavaProviders = () => {
    if (window.javaProvidersRegistered) return;
    window.javaProvidersRegistered = true;

    const keywords = ['abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final', 'finally', 'float', 'for', 'goto', 'if', 'implements', 'import', 'instanceof', 'int', 'interface', 'long', 'native', 'new', 'package', 'private', 'protected', 'public', 'return', 'short', 'static', 'strictfp', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'try', 'void', 'volatile', 'while'];
    
    // Mapping of common Java class methods for "Eclipse-like" feel
    const MEMBER_PROVIDERS = {
        'System.out': [
            { label: 'println', detail: 'void println(String x)', doc: 'Prints a String and then terminates the line.' },
            { label: 'print', detail: 'void print(String x)', doc: 'Prints a string.' },
            { label: 'printf', detail: 'PrintStream printf(String format, Object... args)', doc: 'A convenience method to write a formatted string to this output stream.' }
        ],
        'String': [
            { label: 'length', detail: 'int length()', doc: 'Returns the length of this string.' },
            { label: 'substring', detail: 'String substring(int beginIndex)', doc: 'Returns a string that is a substring of this string.' },
            { label: 'equals', detail: 'boolean equals(Object anObject)', doc: 'Compares this string to the specified object.' },
            { label: 'charAt', detail: 'char charAt(int index)', doc: 'Returns the char value at the specified index.' },
            { label: 'toLowerCase', detail: 'String toLowerCase()', doc: 'Converts all of the characters in this String to lower case.' },
            { label: 'trim', detail: 'String trim()', doc: 'Returns a string whose value is this string, with all leading and trailing space removed.' },
            { label: 'split', detail: 'String[] split(String regex)', doc: 'Splits this string around matches of the given regular expression.' },
            { label: 'contains', detail: 'boolean contains(CharSequence s)', doc: 'Returns true if and only if this string contains the specified sequence of char values.' }
        ],
        'Math': [
            { label: 'abs', detail: 'double abs(double a)', doc: 'Returns the absolute value of a double value.' },
            { label: 'max', detail: 'double max(double a, double b)', doc: 'Returns the greater of two double values.' },
            { label: 'min', detail: 'double min(double a, double b)', doc: 'Returns the smaller of two double values.' },
            { label: 'sqrt', detail: 'double sqrt(double a)', doc: 'Returns the correctly rounded positive square root of a double value.' },
            { label: 'random', detail: 'double random()', doc: 'Returns a double value with a positive sign, greater than or equal to 0.0 and less than 1.0.' },
            { label: 'pow', detail: 'double pow(double a, double b)', doc: 'Returns the value of the first argument raised to the power of the second argument.' }
        ],
        'List': [
            { label: 'add', detail: 'boolean add(E e)', doc: 'Appends the specified element to the end of this list.' },
            { label: 'get', detail: 'E get(int index)', doc: 'Returns the element at the specified position in this list.' },
            { label: 'remove', detail: 'E remove(int index)', doc: 'Removes the element at the specified position in this list.' },
            { label: 'size', detail: 'int size()', doc: 'Returns the number of elements in this list.' },
            { label: 'clear', detail: 'void clear()', doc: 'Removes all of the elements from this list.' },
            { label: 'isEmpty', detail: 'boolean isEmpty()', doc: 'Returns true if this list contains no elements.' }
        ],
        'ArrayList': [
            { label: 'add', detail: 'boolean add(E e)', doc: 'Appends the specified element to the end of this list.' },
            { label: 'get', detail: 'E get(int index)', doc: 'Returns the element at the specified position in this list.' },
            { label: 'size', detail: 'int size()', doc: 'Returns the number of elements in this list.' },
            { label: 'toArray', detail: 'Object[] toArray()', doc: 'Returns an array containing all of the elements in this list.' }
        ],
        'Map': [
            { label: 'put', detail: 'V put(K key, V value)', doc: 'Associates the specified value with the specified key in this map.' },
            { label: 'get', detail: 'V get(Object key)', doc: 'Returns the value to which the specified key is mapped.' },
            { label: 'containsKey', detail: 'boolean containsKey(Object key)', doc: 'Returns true if this map contains a mapping for the specified key.' },
            { label: 'keySet', detail: 'Set<K> keySet()', doc: 'Returns a Set view of the keys contained in this map.' }
        ],
        'Scanner': [
            { label: 'next', detail: 'String next()', doc: 'Finds and returns the next complete token from this scanner.' },
            { label: 'nextLine', detail: 'String nextLine()', doc: 'Advances this scanner past the current line and returns the input that was skipped.' },
            { label: 'nextInt', detail: 'int nextInt()', doc: 'Scans the next token of the input as an int.' },
            { label: 'nextDouble', detail: 'double nextDouble()', doc: 'Scans the next token of the input as a double.' },
            { label: 'hasNext', detail: 'boolean hasNext()', doc: 'Returns true if this scanner has another token in its input.' }
        ],
        'Integer': [
            { label: 'parseInt', detail: 'static int parseInt(String s)', doc: 'Parses the string argument as a signed decimal integer.' },
            { label: 'valueOf', detail: 'static Integer valueOf(int i)', doc: 'Returns an Integer instance representing the specified int value.' },
            { label: 'compare', detail: 'static int compare(int x, int y)', doc: 'Compares two int values numerically.' }
        ]
    };
    MEMBER_PROVIDERS['HashMap'] = MEMBER_PROVIDERS['Map'];
    MEMBER_PROVIDERS['Double'] = [
        { label: 'parseDouble', detail: 'static double parseDouble(String s)', doc: 'Returns a new double initialized to the value represented by the specified String.' },
        { label: 'isNaN', detail: 'static boolean isNaN(double v)', doc: 'Returns true if the specified number is a Not-a-Number (NaN) value.' }
    ];

    monaco.languages.registerCompletionItemProvider('java', {
        triggerCharacters: ['.'],
        provideCompletionItems: (model, position) => {
            const textUntilPosition = model.getValueInRange({
                startLineNumber: 1,
                startColumn: 1,
                endLineNumber: position.lineNumber,
                endColumn: position.column
            });

            const word = model.getWordUntilPosition(position);
            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn
            };

            // Check if we are after a dot
            const lineContent = model.getLineContent(position.lineNumber);
            const charBefore = lineContent[position.column - 2];

            if (charBefore === '.') {
                const match = lineContent.substring(0, position.column - 1).match(/([a-zA-Z0-9_.]+)\.$/);
                if (match) {
                    const objectName = match[1];
                    // Try to find methods for this object/class
                    const members = MEMBER_PROVIDERS[objectName] || MEMBER_PROVIDERS['String']; // Default to String for common cases
                    
                    return {
                        suggestions: members.map(m => ({
                            label: m.label,
                            kind: monaco.languages.CompletionItemKind.Method,
                            insertText: m.label + '(${1})',
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            range: range,
                            detail: m.detail,
                            documentation: m.doc
                        }))
                    };
                }
            }

            // Standard completions (Keywords, etc.)
            const text = model.getValue();
            const userMethods = [...text.matchAll(/(?:public|private|protected|static|\s) +[\w\<\>\[\]]+\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g)].map(m => m[1]);
            const userVariables = [...text.matchAll(/\b[\w\<\>\[\]]+\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:=|;)/g)].map(m => m[1]);

            return {
                suggestions: [
                    ...keywords.map(k => ({ label: k, kind: monaco.languages.CompletionItemKind.Keyword, insertText: k, range: range })),
                    ...userMethods.map(m => ({ label: m, kind: monaco.languages.CompletionItemKind.Method, insertText: m + '(${1})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range: range, detail: 'User method' })),
                    ...userVariables.map(v => ({ label: v, kind: monaco.languages.CompletionItemKind.Variable, insertText: v, range: range, detail: 'User variable' })),
                    { label: 'sysout', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'System.out.println(${1});', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range: range, detail: 'Eclipse shortcut' },
                    { label: 'main', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'public static void main(String[] args) {\n\t${1}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range: range }
                ]
            };
        }
    });
};
