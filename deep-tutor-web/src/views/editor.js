import { api } from "../api.js";

export const Editor = (data) => {
    const { exercise } = data;
    
    const formattedDescription = exercise ? exercise.description.replace(/\n/g, '<br/>') : 'Cargando detalles del ejercicio...';
    const problemName = exercise ? exercise.title.replace(/\s+/g, '_') : 'Solucion';

    // Parsear ejemplos si existen
    let examplesHTML = '';
    let firstExampleInput = '';
    if (exercise && exercise.examples) {
        try {
            const examples = typeof exercise.examples === 'string' ? JSON.parse(exercise.examples) : exercise.examples;
            if (Array.isArray(examples) && examples.length > 0) {
                const firstEx = examples[0];
                firstExampleInput = firstEx.Entrada || firstEx.input || '';
            }
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
                <div class="flex gap-3" id="autosave-indicator">
                    <div class="flex items-center gap-2 text-on-surface-variant/50 text-[10px] font-bold uppercase tracking-widest bg-surface-container-high/50 px-4 py-2 rounded-xl border border-outline-variant/30">
                        <span class="material-symbols-outlined text-xs animate-pulse text-success">cloud_done</span> Autoguardado
                    </div>
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

                <div class="bg-surface-container border border-outline-variant p-6 rounded-2xl flex flex-col gap-4 shadow-lg border-l-4 border-l-primary">
                    <h3 class="font-bold text-primary flex items-center gap-2 uppercase tracking-widest text-xs">
                        <span class="material-symbols-outlined text-sm">psychology</span> Tutor IA
                    </h3>
                    <p class="text-xs text-on-surface-variant leading-relaxed">¿Te quedaste trabado? El Mentor IA puede analizar tu código y explicarte cómo avanzar sin darte la solución directa.</p>
                    <button id="ai-help-btn" class="w-full bg-primary text-on-primary py-4 rounded-xl text-[11px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(192,193,255,0.4)] transition-all flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined text-base" style="font-variation-settings: 'FILL' 1;">smart_toy</span>
                        Pedir Ayuda IA
                    </button>
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
                            placeholder="Ej: 10\nHola Mundo\n...">${firstExampleInput}</textarea>
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
        // Enhance Syntax Highlighting
        enhancePythonSyntax();
        enhanceJavaSyntax();
        enhanceLuaSyntax();

        // Initialize Editor
        const editor = monaco.editor.create(container, {
            value: exercise?.initial_code || LANGUAGE_CONFIG.python.defaultCode,
            language: 'python',
            theme: 'vs-dark',
            automaticLayout: true,
            fontSize: 14,
            fontFamily: "'Fira Code', 'Cascadia Code', monospace",
            minimap: { enabled: false },
            padding: { top: 20 },
            roundedSelection: true,
            scrollbar: {
                vertical: 'hidden',
                horizontal: 'auto'
            },
            fixedOverflowWidgets: true
        });

        // Force syntax refresh
        setTimeout(() => {
            const model = editor.getModel();
            if (model) {
                const currentLang = langSelector.value;
                const config = LANGUAGE_CONFIG[currentLang];
                monaco.editor.setModelLanguage(model, config.monaco);
            }
        }, 100);

        // --- AUTOSAVE LOGIC ---
        const getSaveKey = () => `deeptutor_code_${exercise?.id || 'sandbox'}_${langSelector.value}`;
        
        // Load saved code
        const savedCode = localStorage.getItem(getSaveKey());
        if (savedCode) {
            console.log(`[EDITOR] Restoring saved code for ${langSelector.value}`);
            editor.setValue(savedCode);
        } else if (exercise?.initial_code) {
             editor.setValue(exercise.initial_code);
        }

        // Handle changes for autosave
        editor.onDidChangeModelContent(() => {
            const code = editor.getValue();
            localStorage.setItem(getSaveKey(), code);
            
            // Visual indicator
            const indicator = document.getElementById('autosave-indicator');
            if (indicator) {
                const icon = indicator.querySelector('.material-symbols-outlined');
                if (icon) {
                    icon.textContent = 'sync';
                    icon.classList.add('animate-spin');
                    setTimeout(() => {
                        icon.textContent = 'cloud_done';
                        icon.classList.remove('animate-spin');
                    }, 500);
                }
            }
        });

        // Update value on language change if no manual changes were made
        const originalLangCode = editor.getValue();
        // ----------------------

        // Store editor instance globally if needed
        window.currentEditor = editor;

        let lastError = '';
        let lastOutput = '';

        // Language change handler
        langSelector.addEventListener('change', (e) => {
            const lang = e.target.value;
            const config = LANGUAGE_CONFIG[lang];
            
            // Update Monaco language
            monaco.editor.setModelLanguage(editor.getModel(), config.monaco);
            
            // Update Filename
            filenameDisplay.textContent = `${problemName}${config.extension}`;
            
            // Try to load saved code for this new language
            const saved = localStorage.getItem(getSaveKey());
            if (saved) {
                editor.setValue(saved);
            } else {
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
                
                // Reset context for AI help
                lastError = '';
                lastOutput = '';
                
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
                        lastError = '';
                        lastOutput = result.stdout || '';
                        let outputHTML = '';
                        if (result.stdout) {
                            outputHTML += `<div class="text-on-surface mb-2 whitespace-pre-wrap font-mono">${cleanTraceback(result.stdout)}</div>`;
                        }
                        if (result.stderr) {
                            lastError = result.stderr;
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
                        lastError = rawError;
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
                
                // Reset context for AI help
                lastError = '';
                lastOutput = '';
                
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
                    let submissionExceptionStderr = null;
                    for (let i = 0; i < testCases.length; i++) {
                        const tc = testCases[i];
                        const input = tc.Entrada || tc.input || '';
                        const expectedOutput = (tc.Salida || tc.output || '').toString().trim();
                        
                        consoleOutput.innerHTML = `<div class="flex flex-col gap-2"><div class="flex items-center gap-2 text-primary animate-pulse"><span class="material-symbols-outlined text-sm">hourglass_empty</span> <span>Evaluando caso ${i + 1}/${testCases.length}...</span></div></div>`;

                        const result = await api.executeCode(code, language, input);
                        
                        const actualOutput = (result.stdout || '').toString().trim();
                        const isCorrect = actualOutput === expectedOutput && result.status === 'success';

                        if (isCorrect) {
                            passedCount++;
                        } else {
                            if (!lastError) {
                                // Capturamos el primer error para el botón de ayuda
                                lastError = result.stderr ? cleanTraceback(result.stderr) : `Salida incorrecta en Caso ${i+1}. Esperado: "${expectedOutput}", Obtenido: "${actualOutput}"`;
                            }
                            if ((result.exit_code !== 0 || result.stderr) && !submissionExceptionStderr) {
                                submissionExceptionStderr = result.stderr;
                            }
                        }

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
                        
                        // Si todo está correcto, actualizamos el score global del tema
                        if (allPassed && exercise.topic_id) {
                            await api.updateUserTopicProgress(user.id, exercise.topic_id);
                        }

                        // Si hubo alguna excepción durante la ejecución de los casos de prueba, la registramos una única vez
                        if (submissionExceptionStderr) {
                            try {
                                console.log('[EDITOR] Recording submission exception to DB...');
                                await api.recordException(submissionExceptionStderr, language, user.id);
                            } catch (err) {
                                console.error('[EDITOR] Error recording submission exception:', err);
                            }
                        }
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
        registerLuaProviders();

        // AYUDA IA handler
        const aiHelpBtn = document.getElementById('ai-help-btn');
        if (aiHelpBtn) {
            aiHelpBtn.addEventListener('click', async () => {
                const user = await api.getUser();
                if (!user || !user.id) {
                    return ui.alert({ title: 'Error', message: 'Debes iniciar sesión para pedir ayuda al mentor.', type: 'error' });
                }

                aiHelpBtn.disabled = true;
                const originalContent = aiHelpBtn.innerHTML;
                aiHelpBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">sync</span> Generando Ayuda...';

                try {
                    const code = editor.getValue();
                    const language = langSelector.value;
                    const testCases = exercise?.examples ? (typeof exercise.examples === 'string' ? JSON.parse(exercise.examples) : exercise.examples) : [];
                    
                    const prompt = `Hola Mentor IA, necesito ayuda con el ejercicio "${exercise?.title || 'Sandbox'}".

ENUNCIADO:
${exercise?.description || 'No hay descripción disponible.'}

CASOS DE PRUEBA:
${testCases.map((tc, i) => `Caso ${i+1}: Entrada: ${tc.input || tc.Entrada}, Salida esperada: ${tc.output || tc.Salida}`).join('\n')}

MI CÓDIGO (${language}):
\`\`\`${language}
${code}
\`\`\`

ERROR/SALIDA ACTUAL:
${lastError || lastOutput || 'Aún no he ejecutado el código o no hay errores registrados.'}

¿Podrías explicarme qué estoy haciendo mal y darme pistas de cómo solucionarlo? No me des la solución completa directamente, prefiero aprender guiado.`;

                    // 1. Cargar configuración del Mentor (instrucciones de sistema)
                    let systemInstruction = "";
                    try {
                        const [rulesRes, skillsRes] = await Promise.all([
                            fetch('/dashboard/assets/mentor/rules.md'),
                            fetch('/dashboard/assets/mentor/skills.md')
                        ]);
                        systemInstruction = `${await rulesRes.text()}\n\n${await skillsRes.text()}`;
                    } catch (e) {
                        systemInstruction = "Eres un mentor de programación experto que ayuda a los alumnos sin darles la solución directa.";
                    }

                    // 2. Obtener respuesta REAL de la IA
                    const aiResponse = await api.getAIResponse(systemInstruction, prompt);
                    const responseText = aiResponse?.text || '¡Hola! He recibido tu consulta. Vamos al chat para analizarlo juntos...';

                    const title = `Pista ejercicio ${exercise?.title || 'Sandbox'}`;
                    // Create new conversation
                    const newConv = await api.createConversation(user.id, title);
                    if (!newConv) throw new Error('No se pudo crear la conversación');

                    // Save the contextual message with REAL AI response
                    await api.saveChatMessage(user.id, newConv.id, prompt, responseText);

                    // Navigate to chat
                    window.location.hash = `#/chat/${newConv.id}`;
                    
                } catch (error) {
                    console.error('[EDITOR] Error getting AI help:', error);
                    ui.alert({ title: 'Error', message: 'No se pudo conectar con el Mentor IA: ' + error.message, type: 'error' });
                } finally {
                    aiHelpBtn.disabled = false;
                    aiHelpBtn.innerHTML = originalContent;
                }
            });
        }
    });
};  

/**
 * Enhances Python syntax highlighting to support f-string interpolation
 */
const enhancePythonSyntax = () => {
    console.log('[EDITOR] Setting up Python enhancement hook...');
    
    // This hook ensures our provider is applied AFTER Monaco's default one loads
    monaco.languages.onLanguage('python', () => {
        console.log('[EDITOR] Applying custom Python Monarch rules...');
        monaco.languages.setMonarchTokensProvider('python', {
            defaultToken: '',
            tokenPostfix: '.py',
            keywords: [
                'and', 'as', 'assert', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except',
                'False', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'None',
                'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'True', 'try', 'while', 'with', 'yield'
            ],
            builtins: [
                'abs', 'all', 'any', 'ascii', 'bin', 'bool', 'breakpoint', 'bytearray', 'bytes',
                'callable', 'chr', 'classmethod', 'compile', 'complex', 'delattr', 'dict', 'dir',
                'divmod', 'enumerate', 'eval', 'exec', 'filter', 'float', 'format', 'frozenset',
                'getattr', 'globals', 'hasattr', 'hash', 'help', 'hex', 'id', 'input', 'int',
                'isinstance', 'issubclass', 'iter', 'len', 'list', 'locals', 'map', 'max',
                'memoryview', 'min', 'next', 'object', 'oct', 'open', 'ord', 'pow', 'print',
                'property', 'range', 'reversed', 'round', 'set', 'setattr', 'slice',
                'sorted', 'staticmethod', 'str', 'sum', 'super', 'tuple', 'type', 'vars', 'zip'
            ],
            tokenizer: {
                root: [
                    [/[a-zA-Z_]\w*/, {
                        cases: {
                            '@keywords': 'keyword',
                            '@builtins': 'type.identifier',
                            '@default': 'identifier'
                        }
                    }],
                    // F-Strings
                    [/f"/, { token: 'string.quote', next: '@fstring_double' }],
                    [/f'/, { token: 'string.quote', next: '@fstring_single' }],
                    // Strings
                    [/"/, { token: 'string.quote', next: '@string_double' }],
                    [/'/, { token: 'string.quote', next: '@string_single' }],
                    [/[{}()\[\]]/, '@brackets'],
                    [/[ \t\r\n]+/, 'white'],
                    [/\d+/, 'number'],
                    [/#.*$/, 'comment'],
                ],
                string_double: [
                    [/[^\\"]+/, 'string'],
                    [/\\./, 'string.escape'],
                    [/"/, { token: 'string.quote', next: '@pop' }],
                ],
                string_single: [
                    [/[^\\']+/, 'string'],
                    [/\\./, 'string.escape'],
                    [/'/, { token: 'string.quote', next: '@pop' }],
                ],
                fstring_double: [
                    [/\{/, { token: 'delimiter.bracket', next: '@fstring_expression' }],
                    [/[^\\"{]+/, 'string'],
                    [/\\./, 'string.escape'],
                    [/"/, { token: 'string.quote', next: '@pop' }],
                ],
                fstring_single: [
                    [/\{/, { token: 'delimiter.bracket', next: '@fstring_expression' }],
                    [/[^\\'{]+/, 'string'],
                    [/\\./, 'string.escape'],
                    [/'/, { token: 'string.quote', next: '@pop' }],
                ],
                fstring_expression: [
                    [/\}/, { token: 'delimiter.bracket', next: '@pop' }],
                    [/[a-z_]\w*/i, {
                        cases: {
                            '@keywords': 'keyword',
                            '@builtins': 'type.identifier',
                            '@default': 'identifier'
                        }
                    }],
                    [/[ \t\r\n]+/, 'white'],
                    [/[=><!~?:&|+\-*\/\^%]+/, 'operator'],
                    [/\d+/, 'number'],
                    [/[\[\]\(\),]/, '@brackets'],
                    [/\./, 'delimiter'],
                ]
            }
        });
    });
};

/**
 * Enhances Java syntax highlighting to support STR templates (Java 21)
 */
const enhanceJavaSyntax = () => {
    console.log('[EDITOR] Setting up Java enhancement hook...');
    monaco.languages.onLanguage('java', () => {
        console.log('[EDITOR] Applying custom Java Monarch rules...');
        monaco.languages.setMonarchTokensProvider('java', {
            defaultToken: '',
            tokenPostfix: '.java',
            keywords: ['abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final', 'finally', 'float', 'for', 'goto', 'if', 'implements', 'import', 'instanceof', 'int', 'interface', 'long', 'native', 'new', 'package', 'private', 'protected', 'public', 'return', 'short', 'static', 'strictfp', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'try', 'void', 'volatile', 'while'],
            tokenizer: {
                root: [
                    [/[a-z_$][\w$]*/, { cases: { '@keywords': 'keyword', '@default': 'identifier' } }],
                    [/[A-Z][\w$]*/, 'type.identifier'],
                    [/STR\s*\./, 'keyword'], // Java 21 String Templates
                    [/"/, { token: 'string.quote', next: '@string_double' }],
                    [/[{}()\[\]]/, '@brackets'],
                    [/[ \t\r\n]+/, 'white'],
                    [/\d+/, 'number'],
                ],
                string_double: [
                    [/[^\\"{]+/, 'string'],
                    [/\\\{/, { token: 'delimiter.bracket', next: '@string_expression' }], // Interpolation \{...}
                    [/\\./, 'string.escape'],
                    [/"/, { token: 'string.quote', next: '@pop' }],
                ],
                string_expression: [
                    [/\}/, { token: 'delimiter.bracket', next: '@pop' }],
                    [/[a-z_$][\w$]*/, { cases: { '@keywords': 'keyword', '@default': 'identifier' } }],
                    [/[A-Z][\w$]*/, 'type.identifier'],
                    [/[ \t\r\n]+/, 'white'],
                    [/[=><!~?:&|+\-*\/\^%]+/, 'operator'],
                    [/\d+/, 'number'],
                ]
            }
        });
    });
};

/**
 * Enhances Lua syntax highlighting to support f-strings
 */
const enhanceLuaSyntax = () => {
    console.log('[EDITOR] Setting up Lua enhancement hook...');
    monaco.languages.onLanguage('lua', () => {
        console.log('[EDITOR] Applying custom Lua Monarch rules...');
        monaco.languages.setMonarchTokensProvider('lua', {
            defaultToken: '',
            tokenPostfix: '.lua',
            keywords: ['and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for', 'function', 'if', 'in', 'local', 'nil', 'not', 'or', 'repeat', 'return', 'then', 'true', 'until', 'while'],
            tokenizer: {
                root: [
                    [/[a-zA-Z_]\w*/, { cases: { '@keywords': 'keyword', '@default': 'identifier' } }],
                    // F-Strings for Lua (custom support)
                    [/f"/, { token: 'string.quote', next: '@fstring_double' }],
                    [/"/, { token: 'string.quote', next: '@string_double' }],
                    [/[{}()\[\]]/, '@brackets'],
                    [/[ \t\r\n]+/, 'white'],
                    [/\d+/, 'number'],
                ],
                string_double: [
                    [/[^\\"]+/, 'string'],
                    [/\\./, 'string.escape'],
                    [/"/, { token: 'string.quote', next: '@pop' }],
                ],
                fstring_double: [
                    [/[^\\"{]+/, 'string'],
                    [/\{/, { token: 'delimiter.bracket', next: '@fstring_expression' }],
                    [/\\./, 'string.escape'],
                    [/"/, { token: 'string.quote', next: '@pop' }],
                ],
                fstring_expression: [
                    [/\}/, { token: 'delimiter.bracket', next: '@pop' }],
                    [/[a-zA-Z_]\w*/, { cases: { '@keywords': 'keyword', '@default': 'identifier' } }],
                    [/[ \t\r\n]+/, 'white'],
                    [/[=><!~?:&|+\-*\/\^%]+/, 'operator'],
                ]
            }
        });
    });
};

const registerPythonProviders = () => {
    // Only register once
    if (window.pythonProvidersRegistered) return;
    window.pythonProvidersRegistered = true;

    const keywords = ['False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield'];
    const builtins = ['abs', 'all', 'any', 'ascii', 'bin', 'bool', 'breakpoint', 'bytearray', 'bytes', 'callable', 'chr', 'classmethod', 'compile', 'complex', 'delattr', 'dict', 'dir', 'divmod', 'enumerate', 'eval', 'exec', 'filter', 'float', 'format', 'frozenset', 'getattr', 'globals', 'hasattr', 'hash', 'help', 'hex', 'id', 'input', 'int', 'isinstance', 'issubclass', 'iter', 'len', 'list', 'locals', 'map', 'max', 'memoryview', 'min', 'next', 'object', 'oct', 'open', 'ord', 'pow', 'print', 'property', 'range', 'repr', 'reversed', 'round', 'set', 'setattr', 'slice', 'sorted', 'staticmethod', 'str', 'sum', 'super', 'tuple', 'type', 'vars', 'zip'];

    const MEMBER_PROVIDERS = {
        'list': [
            { label: 'append', detail: 'list.append(x)', doc: 'Add an item to the end of the list.' },
            { label: 'extend', detail: 'list.extend(iterable)', doc: 'Extend the list by appending all the items from the iterable.' },
            { label: 'insert', detail: 'list.insert(i, x)', doc: 'Insert an item at a given position.' },
            { label: 'remove', detail: 'list.remove(x)', doc: 'Remove the first item from the list whose value is equal to x.' },
            { label: 'pop', detail: 'list.pop([i])', doc: 'Remove the item at the given position in the list, and return it.' },
            { label: 'clear', detail: 'list.clear()', doc: 'Remove all items from the list.' },
            { label: 'index', detail: 'list.index(x[, start[, end]])', doc: 'Return zero-based index in the list of the first item whose value is equal to x.' },
            { label: 'count', detail: 'list.count(x)', doc: 'Return the number of times x appears in the list.' },
            { label: 'sort', detail: 'list.sort(*, key=None, reverse=False)', doc: 'Sort the items of the list in place.' },
            { label: 'reverse', detail: 'list.reverse()', doc: 'Reverse the elements of the list in place.' }
        ],
        'dict': [
            { label: 'get', detail: 'dict.get(key[, default])', doc: 'Return the value for key if key is in the dictionary, else default.' },
            { label: 'items', detail: 'dict.items()', doc: 'Return a new view of the dictionary’s items.' },
            { label: 'keys', detail: 'dict.keys()', doc: 'Return a new view of the dictionary’s keys.' },
            { label: 'values', detail: 'dict.values()', doc: 'Return a new view of the dictionary’s values.' },
            { label: 'update', detail: 'dict.update([other])', doc: 'Update the dictionary with the key/value pairs from other.' },
            { label: 'pop', detail: 'dict.pop(key[, default])', doc: 'Remove specified key and return the corresponding value.' }
        ],
        'str': [
            { label: 'split', detail: 'str.split(sep=None, maxsplit=-1)', doc: 'Return a list of the words in the string, using sep as the delimiter string.' },
            { label: 'join', detail: 'str.join(iterable)', doc: 'Return a string which is the concatenation of the strings in iterable.' },
            { label: 'strip', detail: 'str.strip([chars])', doc: 'Return a copy of the string with the leading and trailing characters removed.' },
            { label: 'lower', detail: 'str.lower()', doc: 'Return a copy of the string with all the cased characters converted to lowercase.' },
            { label: 'upper', detail: 'str.upper()', doc: 'Return a copy of the string with all the cased characters converted to uppercase.' },
            { label: 'replace', detail: 'str.replace(old, new[, count])', doc: 'Return a copy of the string with all occurrences of substring old replaced by new.' }
        ]
    };

    monaco.languages.registerCompletionItemProvider('python', {
        triggerCharacters: ['.'],
        provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position);
            const lineContent = model.getLineContent(position.lineNumber);
            const charBefore = lineContent[position.column - 2];
            
            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn
            };

            const text = model.getValue();

            // Member access logic for Python
            if (charBefore === '.') {
                const match = lineContent.substring(0, position.column - 1).match(/([a-zA-Z0-9_]+)\.$/);
                if (match) {
                    const objectName = match[1];
                    let type = null;

                    // Simple inference
                    if (new RegExp(`\\b${objectName}\\s*=\\s*\\[`).test(text)) type = 'list';
                    else if (new RegExp(`\\b${objectName}\\s*=\\s*\\{`).test(text)) type = 'dict';
                    else if (new RegExp(`\\b${objectName}\\s*=\\s*["']`).test(text)) type = 'str';
                    else if (new RegExp(`\\b${objectName}\\s*=\\s*list\\(`).test(text)) type = 'list';
                    else if (new RegExp(`\\b${objectName}\\s*=\\s*dict\\(`).test(text)) type = 'dict';

                    const members = MEMBER_PROVIDERS[type];
                    if (members) {
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
            }
            
            // 1. Encontrar funciones definidas por el usuario
            const userFunctions = [...text.matchAll(/def\s+([a-zA-Z_][a-zA-Z0-9_]*)/g)].map(m => m[1]);
            
            // 2. Encontrar variables definidas por el usuario
            const userVariables = [...text.matchAll(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*=/g)].map(m => m[1]);
            
            const uniqueFunctions = [...new Set(userFunctions)].filter(f => f !== word.word);
            const uniqueVariables = [...new Set(userVariables)].filter(v => v !== word.word);

            const suggestions = [
                ...keywords.map(k => ({ label: k, kind: monaco.languages.CompletionItemKind.Keyword, insertText: k, range })),
                ...builtins.map(b => ({ label: b, kind: monaco.languages.CompletionItemKind.Function, insertText: b + '(${1})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range, detail: 'Built-in function' })),
                ...uniqueFunctions.map(f => ({ label: f, kind: monaco.languages.CompletionItemKind.Function, insertText: f + '(${1})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range, detail: 'User defined function' })),
                ...uniqueVariables.map(v => ({ label: v, kind: monaco.languages.CompletionItemKind.Variable, insertText: v, range, detail: 'User defined variable' })),
                
                // Snippets
                { label: 'def', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'def ${1:function_name}(${2:args}):\n\t${3:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range, detail: 'Function definition' },
                { label: 'class', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'class ${1:ClassName}:\n\tdef __init__(self, ${2:args}):\n\t\t${3:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range, detail: 'Class definition' },
                { label: 'ifmain', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'if __name__ == "__main__":\n\t${1:main()}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range, detail: 'Main block' },
                { label: 'tryexcept', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'try:\n\t${1:pass}\nexcept ${2:Exception} as e:\n\t${3:print(e)}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range, detail: 'Try-Except block' }
            ];

            return { suggestions };
        }
    });
};

const registerJavaProviders = () => {
    if (window.javaProvidersRegistered) return;
    window.javaProvidersRegistered = true;

    const keywords = ['abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final', 'finally', 'float', 'for', 'goto', 'if', 'implements', 'import', 'instanceof', 'int', 'interface', 'long', 'native', 'new', 'package', 'private', 'protected', 'public', 'return', 'short', 'static', 'strictfp', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'try', 'void', 'volatile', 'while'];
    
    const IMPORT_MAP = {
        'Scanner': 'java.util.Scanner',
        'ArrayList': 'java.util.ArrayList',
        'HashMap': 'java.util.HashMap',
        'LinkedList': 'java.util.LinkedList',
        'List': 'java.util.List',
        'Map': 'java.util.Map',
        'Random': 'java.util.Random',
        'File': 'java.io.File',
        'IOException': 'java.io.IOException',
        'LocalDate': 'java.time.LocalDate',
        'Arrays': 'java.util.Arrays',
        'Collections': 'java.util.Collections'
    };

    const MEMBER_PROVIDERS = {
        'System.out': [
            { label: 'println', detail: 'void println(Object x)', doc: 'Prints an Object and then terminates the line.' },
            { label: 'print', detail: 'void print(Object x)', doc: 'Prints an object.' },
            { label: 'printf', detail: 'PrintStream printf(String format, Object... args)', doc: 'A convenience method to write a formatted string.' }
        ],
        'String': [
            { label: 'length', detail: 'int length()', doc: 'Returns the length of this string.' },
            { label: 'substring', detail: 'String substring(int beginIndex)', doc: 'Returns a substring.' },
            { label: 'equals', detail: 'boolean equals(Object anObject)', doc: 'Compares this string to the specified object.' },
            { label: 'charAt', detail: 'char charAt(int index)', doc: 'Returns the char value at the specified index.' },
            { label: 'toLowerCase', detail: 'String toLowerCase()', doc: 'Converts to lower case.' },
            { label: 'toUpperCase', detail: 'String toUpperCase()', doc: 'Converts to upper case.' },
            { label: 'trim', detail: 'String trim()', doc: 'Removes leading and trailing space.' },
            { label: 'split', detail: 'String[] split(String regex)', doc: 'Splits this string around matches of the regex.' },
            { label: 'contains', detail: 'boolean contains(CharSequence s)', doc: 'True if string contains the sequence.' },
            { label: 'isEmpty', detail: 'boolean isEmpty()', doc: 'True if length is 0.' }
        ],
        'Scanner': [
            { label: 'next', detail: 'String next()', doc: 'Finds and returns the next complete token.' },
            { label: 'nextLine', detail: 'String nextLine()', doc: 'Advances this scanner past the current line.' },
            { label: 'nextInt', detail: 'int nextInt()', doc: 'Scans the next token as an int.' },
            { label: 'nextDouble', detail: 'double nextDouble()', doc: 'Scans the next token as a double.' },
            { label: 'hasNext', detail: 'boolean hasNext()', doc: 'True if scanner has another token.' }
        ],
        'Math': [
            { label: 'abs', detail: 'static double abs(double a)', doc: 'Returns the absolute value.' },
            { label: 'max', detail: 'static double max(double a, double b)', doc: 'Returns the greater of two values.' },
            { label: 'min', detail: 'static double min(double a, double b)', doc: 'Returns the smaller of two values.' },
            { label: 'sqrt', detail: 'static double sqrt(double a)', doc: 'Returns the square root.' },
            { label: 'pow', detail: 'static double pow(double a, double b)', doc: 'Returns the value of a raised to the power of b.' },
            { label: 'random', detail: 'static double random()', doc: 'Returns a random value [0.0, 1.0).' }
        ],
        'ArrayList': [
            { label: 'add', detail: 'boolean add(E e)', doc: 'Appends the element to the end of the list.' },
            { label: 'get', detail: 'E get(int index)', doc: 'Returns the element at the specified position.' },
            { label: 'size', detail: 'int size()', doc: 'Returns the number of elements.' },
            { label: 'remove', detail: 'E remove(int index)', doc: 'Removes the element at the specified position.' },
            { label: 'clear', detail: 'void clear()', doc: 'Removes all elements.' },
            { label: 'isEmpty', detail: 'boolean isEmpty()', doc: 'True if list contains no elements.' }
        ],
        'Arrays': [
            { label: 'sort', detail: 'static void sort(T[] a)', doc: 'Sorts the specified array into ascending numerical order.' },
            { label: 'toString', detail: 'static String toString(T[] a)', doc: 'Returns a string representation of the contents of the specified array.' },
            { label: 'asList', detail: 'static List<T> asList(T... a)', doc: 'Returns a fixed-size list backed by the specified array.' }
        ],
        'Collections': [
            { label: 'sort', detail: 'static void sort(List<T> list)', doc: 'Sorts the specified list into ascending order.' },
            { label: 'reverse', detail: 'static void reverse(List<?> list)', doc: 'Reverses the order of the elements in the specified list.' },
            { label: 'max', detail: 'static T max(Collection<? extends T> coll)', doc: 'Returns the maximum element of the given collection.' }
        ],
        'Integer': [
            { label: 'parseInt', detail: 'static int parseInt(String s)', doc: 'Parses the string argument as a signed decimal integer.' },
            { label: 'compare', detail: 'static int compare(int x, int y)', doc: 'Compares two int values numerically.' }
        ]
    };

    // Helper to get symbol table and inferred types
    const getSymbolTable = (model) => {
        const text = model.getValue();
        const symbols = {
            variables: new Map(), // name -> type
            methods: new Set(),
            imports: new Set(),
            package: null
        };

        // Detect package
        const pkgMatch = text.match(/package\s+([\w\.]+);/);
        if (pkgMatch) symbols.package = pkgMatch[1];

        // Detect existing imports
        const importMatches = text.matchAll(/import\s+([\w\.]+);/g);
        for (const match of importMatches) {
            symbols.imports.add(match[1]);
        }

        // Simple Type Inference Heuristics
        // 1. Explicit declarations: Scanner sc = ... or String name;
        const varMatches = text.matchAll(/\b([A-Z]\w*(?:<[\w\s,<>]+>)?|int|double|boolean|long|float|char|byte|short|String)\s+([a-z]\w*)\b\s*(?:=|;)/g);
        for (const match of varMatches) {
            symbols.variables.set(match[2], match[1].split('<')[0]); // Strip generics for lookup
        }

        // 2. Constructor inference: var = new Scanner(...)
        const constMatches = text.matchAll(/\b([a-z]\w*)\s*=\s*new\s+([A-Z]\w*)/g);
        for (const match of constMatches) {
            symbols.variables.set(match[1], match[2]);
        }

        // Detect user methods
        const methodMatches = text.matchAll(/(?:public|private|protected|static|\s) +[\w\<\>\[\]]+\s+([a-zA-Z_]\w*)\s*\(/g);
        for (const match of methodMatches) {
            symbols.methods.add(match[1]);
        }

        return symbols;
    };

    // Helper to calculate auto-import text edit
    const getImportEdit = (model, symbols, className) => {
        const fullImport = IMPORT_MAP[className];
        if (!fullImport || symbols.imports.has(fullImport)) return null;

        const text = model.getValue();
        const importLine = `import ${fullImport};\n`;
        
        // Find best position to insert
        const lines = text.split('\n');
        let insertLine = 1;
        let lastImportLine = -1;

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim().startsWith('package ')) insertLine = i + 2;
            if (lines[i].trim().startsWith('import ')) lastImportLine = i + 1;
        }

        const finalPos = lastImportLine !== -1 ? lastImportLine + 1 : insertLine;

        return {
            range: new monaco.Range(finalPos, 1, finalPos, 1),
            text: importLine
        };
    };

    // Snippet Provider for common shortcuts
    monaco.languages.registerCompletionItemProvider('java', {
        provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position);
            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn
            };

            return {
                suggestions: [
                    {
                        label: 'syso',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        documentation: 'System.out.println();',
                        insertText: 'System.out.println(${1});',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        range: range
                    },
                    {
                        label: 'main',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        documentation: 'public static void main(String[] args)',
                        insertText: 'public static void main(String[] args) {\n\t${1}\n}',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        range: range
                    }
                ]
            };
        }
    });

    monaco.languages.registerCompletionItemProvider('java', {
        triggerCharacters: ['.'],
        provideCompletionItems: (model, position) => {
            const symbols = getSymbolTable(model);
            const word = model.getWordUntilPosition(position);
            const lineContent = model.getLineContent(position.lineNumber);
            const charBefore = lineContent[position.column - 2];
            
            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn
            };

            // CASE: Member access (dot triggered)
            if (charBefore === '.') {
                const fullLineUntilDot = lineContent.substring(0, position.column - 1);
                const match = fullLineUntilDot.match(/([a-zA-Z0-9_"]+)\.$/);
                
                if (match) {
                    let objectName = match[1];
                    let type = null;

                    // Support for literals: "text".
                    if (objectName.startsWith('"')) type = 'String';
                    else type = symbols.variables.get(objectName) || objectName;
                    
                    const members = MEMBER_PROVIDERS[type] || MEMBER_PROVIDERS['String'];
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

            // CASE: Standard completions & Auto-imports
            const suggestions = [
                // Keywords
                ...keywords.map(k => ({ label: k, kind: monaco.languages.CompletionItemKind.Keyword, insertText: k, range })),
                
                // User defined symbols
                ...Array.from(symbols.methods).map(m => ({ label: m, kind: monaco.languages.CompletionItemKind.Method, insertText: m + '(${1})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range, detail: 'Método definido por usuario' })),
                ...Array.from(symbols.variables.keys()).map(v => ({ label: v, kind: monaco.languages.CompletionItemKind.Variable, insertText: v, range, detail: `Variable (${symbols.variables.get(v)})` })),

                // Snippets
                { label: 'main', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'public static void main(String[] args) {\n\t${1}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range, detail: 'Main method' },
                { label: 'sout', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'System.out.println(${1});', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range, detail: 'System.out.println' },
                { label: 'fori', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'for (int i = 0; i < ${1:10}; i++) {\n\t${2}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range, detail: 'For loop' },
                { label: 'trycatch', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'try {\n\t${1}\n} catch (Exception e) {\n\t${2:e.printStackTrace();}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range, detail: 'Try-catch block' },

                // Classes with Auto-Import
                ...Object.keys(IMPORT_MAP).map(className => {
                    const edit = getImportEdit(model, symbols, className);
                    return {
                        label: className,
                        kind: monaco.languages.CompletionItemKind.Class,
                        insertText: className,
                        range,
                        detail: `Class ${IMPORT_MAP[className]}`,
                        additionalTextEdits: edit ? [edit] : []
                    };
                })
            ];

            return { suggestions };
        }
    });
};

const registerLuaProviders = () => {
    if (window.luaProvidersRegistered) return;
    window.luaProvidersRegistered = true;

    const keywords = ['and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for', 'function', 'if', 'in', 'local', 'nil', 'not', 'or', 'repeat', 'return', 'then', 'true', 'until', 'while'];
    const builtins = ['print', 'type', 'pairs', 'ipairs', 'tostring', 'tonumber', 'assert', 'error', 'pcall', 'select', 'next'];
    
    const MEMBER_PROVIDERS = {
        'table': [
            { label: 'insert', detail: 'table.insert(list, [pos,] value)', doc: 'Inserts element value at position pos in list.' },
            { label: 'remove', detail: 'table.remove(list [, pos])', doc: 'Removes from list the element at position pos.' },
            { label: 'sort', detail: 'table.sort(list [, comp])', doc: 'Sorts list elements in a given order.' },
            { label: 'concat', detail: 'table.concat(list [, sep [, i [, j]]])', doc: 'Returns the concatenation of the elements of list.' }
        ],
        'math': [
            { label: 'abs', detail: 'math.abs(x)', doc: 'Returns the absolute value of x.' },
            { label: 'floor', detail: 'math.floor(x)', doc: 'Returns the largest integer smaller than or equal to x.' },
            { label: 'ceil', detail: 'math.ceil(x)', doc: 'Returns the smallest integer larger than or equal to x.' },
            { label: 'max', detail: 'math.max(x, ...)', doc: 'Returns the argument with the maximum value.' },
            { label: 'min', detail: 'math.min(x, ...)', doc: 'Returns the argument with the minimum value.' },
            { label: 'sqrt', detail: 'math.sqrt(x)', doc: 'Returns the square root of x.' },
            { label: 'random', detail: 'math.random([m [, n]])', doc: 'Returns a pseudo-random float or integer.' }
        ],
        'string': [
            { label: 'sub', detail: 'string.sub(s, i [, j])', doc: 'Returns the substring of s that starts at i and continues until j.' },
            { label: 'upper', detail: 'string.upper(s)', doc: 'Returns a copy of this string with all lowercase letters changed to uppercase.' },
            { label: 'lower', detail: 'string.lower(s)', doc: 'Returns a copy of this string with all uppercase letters changed to lowercase.' },
            { label: 'len', detail: 'string.len(s)', doc: 'Returns its length.' },
            { label: 'find', detail: 'string.find(s, pattern [, init [, plain]])', doc: 'Looks for the first match of pattern in the string s.' }
        ]
    };

    monaco.languages.registerCompletionItemProvider('lua', {
        triggerCharacters: ['.'],
        provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position);
            const lineContent = model.getLineContent(position.lineNumber);
            const charBefore = lineContent[position.column - 2];
            
            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn
            };

            if (charBefore === '.') {
                const match = lineContent.substring(0, position.column - 1).match(/([a-zA-Z0-9_]+)\.$/);
                if (match) {
                    const objectName = match[1];
                    const members = MEMBER_PROVIDERS[objectName];
                    if (members) {
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
            }

            const text = model.getValue();
            const userFunctions = [...text.matchAll(/function\s+([a-zA-Z_][a-zA-Z0-9_]*)/g)].map(m => m[1]);
            const userVariables = [...text.matchAll(/\b(local\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s*=/g)].map(m => m[2]);

            const suggestions = [
                ...keywords.map(k => ({ label: k, kind: monaco.languages.CompletionItemKind.Keyword, insertText: k, range })),
                ...builtins.map(b => ({ label: b, kind: monaco.languages.CompletionItemKind.Function, insertText: b + '(${1})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range, detail: 'Built-in function' })),
                ...userFunctions.map(f => ({ label: f, kind: monaco.languages.CompletionItemKind.Function, insertText: f + '(${1})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range, detail: 'User function' })),
                ...[...new Set(userVariables)].map(v => ({ label: v, kind: monaco.languages.CompletionItemKind.Variable, insertText: v, range, detail: 'User variable' })),
                
                // Snippets
                { label: 'fori', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'for i = 1, ${1:10} do\n\t${2}\nend', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range, detail: 'Numeric for loop' },
                { label: 'forp', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'for k, v in pairs(${1:table}) do\n\t${2}\nend', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range, detail: 'Pairs loop' },
                { label: 'if', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'if ${1:condition} then\n\t${2}\nend', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range, detail: 'If block' }
            ];

            return { suggestions };
        }
    });
};
