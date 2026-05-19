/**
 * API Service for DeepTutor
 * Fetches data from the backend endpoints.
 */

const BASE_URL = ''; // Relative to the current origin

const DEFAULT_USER = {
    name: "Guest",
    level: 0,
    stats: {
        studyTime: 0,
        exercisesDone: 0,
        streak: 0,
        level: 1
    }
};

export const api = {
    getUser: async () => {
        const storedUser = localStorage.getItem('user');
        console.log('[API] User:', storedUser);
        if (storedUser) {
            const user = JSON.parse(storedUser);
            // Ensure stats and id exist
            if (!user.id) user.id = JSON.parse(storedUser).id; // ID por defecto de la doc
            if (!user.stats) user.stats = DEFAULT_USER.stats;
            return user;
        }
        return { ...DEFAULT_USER, id: 25 };
    },
    
    getSessions: async (user_id) => {
        try {
            // Fetch both conversations and exercises to show as "recent activity"
            const [conversations, exercises] = await Promise.all([
                api.getConversations(user_id),
                api.getExerciseProgress(user_id)
            ]);

            const sessions = [
                ...conversations.map(c => ({
                    id: c.id,
                    title: c.nombre || "Conversación con Mentor",
                    date: new Date(c.started_at).toLocaleDateString(),
                    duration: "Sesión de Chat",
                    type: "chat",
                    timestamp: new Date(c.started_at).getTime()
                })),
                ...exercises.map(e => ({
                    id: e.id,
                    title: `Ejercicio #${e.ejer_id}`,
                    date: new Date(e.envio_send_time).toLocaleDateString(),
                    duration: e.estado === 1 ? "Completado" : "Pendiente",
                    type: "exercise",
                    timestamp: new Date(e.envio_send_time).getTime()
                }))
            ];

            // Sort by most recent (descending) with safety fallbacks for invalid dates
            return sessions.sort((a, b) => {
                const tA = isNaN(a.timestamp) ? 0 : a.timestamp;
                const tB = isNaN(b.timestamp) ? 0 : b.timestamp;
                return tB - tA;
            }).slice(0, 5);
        } catch (error) {
            console.error('[API] Error fetching sessions:', error);
            return [];
        }
    },

    getUserErrors: async (usuario_id) => {
        try {
            const response = await fetch(`${BASE_URL}/api/user_errors?usuario_id=eq.${usuario_id}`);
            return await response.json();
        } catch (error) {
            console.error('[API] Error fetching user errors:', error);
            return [];
        }
    },

    getErrorDetails: async (error_id) => {
        try {
            const response = await fetch(`${BASE_URL}/api/errores_detectados?id=eq.${error_id}`);
            const data = await response.json();
            return Array.isArray(data) ? data[0] : data;
        } catch (error) {
            console.error('[API] Error fetching error details:', error);
            return null;
        }
    },

    getDashboardData: async () => {
        const user = await api.getUser();
        if (!user || !user.id) return { user, sessions: [], progress: null };

        try {
            // Fetch stats, sessions, and errors in parallel
            console.log("[API] Fetching dashboard data for user:", user.id);
            const [sessions, exerciseStats, userProgress, userErrors] = await Promise.all([
                api.getSessions(user.id),
                fetch(`${BASE_URL}/api/user_ejer/stats?user_id=${user.id}`).then(res => res.json()),
                fetch(`${BASE_URL}/api/progreso_usuario?usuario_id=eq.${user.id}&order=updated_at.desc&limit=1`).then(res => res.json()),
                api.getUserErrors(user.id)
            ]);

            console.log("[API] Sessions Received:", sessions);

            console.log('[API] Dashboard Stats Received:', { exerciseStats });

            // Calculate stats dynamically
            // Extract exercises count from stats or fallback to existing logic
            let exercisesDone = 0;
            if (exerciseStats) {
                // Handle both single object or array response
                const statsObj = Array.isArray(exerciseStats) ? exerciseStats[0] : exerciseStats;
                exercisesDone = statsObj?.cantidad_ejercicios || statsObj?.total_completados || statsObj?.count || 0;
            }

            const stats = {
                exercisesDone: exercisesDone,
                streak: 1, // Placeholder for real streak logic
                level: user.nivel || "Principiante"
            };

            let currentGoal = Array.isArray(userProgress) ? (userProgress[0] || null) : (userProgress || null);
            if (currentGoal && currentGoal.topic_id) {
                try {
                    const topic = await fetch(`${BASE_URL}/api/topics/${currentGoal.topic_id}`).then(res => res.json());
                    currentGoal.topic_name = topic.nombre || topic[0]?.nombre || "Tema desconocido";
                } catch (e) {
                    currentGoal.topic_name = "Continuar aprendizaje";
                }

                try {
                    // Fetch total exercises count in the current topic via API stats
                    const statsResponse = await fetch(`${BASE_URL}/api/exercises/stats?topic_id=eq.${currentGoal.topic_id}`).then(res => res.json());
                    const statsObj = Array.isArray(statsResponse) ? statsResponse[0] : statsResponse;
                    const totalExercises = statsObj?.cantidad_ejercicios || 0;

                    // Fetch all exercises and progress records to calculate dynamic percentage
                    const [exercises, progressRecords] = await Promise.all([
                        api.getExercises(),
                        api.getExerciseProgress(user.id)
                    ]);
                    
                    const exercisesInTopic = exercises.filter(ex => ex.topic_id === currentGoal.topic_id);
                    const completedInTopic = progressRecords.filter(p => {
                        const exercise = exercisesInTopic.find(ex => ex.id == p.ejer_id);
                        return exercise && p.estado === 2; // 2: completed (exitoso)
                    }).length;

                    // Find first exercise in this topic that is not completed (estado !== 2)
                    const nextUncompletedExercise = exercisesInTopic.find(ex => {
                        const prog = progressRecords.find(p => p.ejer_id == ex.id);
                        return !prog || prog.estado !== 2;
                    });
                    if (nextUncompletedExercise) {
                        currentGoal.next_exercise_id = nextUncompletedExercise.id;
                    }

                    if (totalExercises > 0) {
                        currentGoal.score = Math.round((completedInTopic / totalExercises) * 100);
                    } else if (exercisesInTopic.length > 0) {
                        currentGoal.score = Math.round((completedInTopic / exercisesInTopic.length) * 100);
                    } else {
                        currentGoal.score = 0;
                    }
                    console.log(`[API] Dynamic progress for topic ${currentGoal.topic_id}: completed=${completedInTopic}, total=${totalExercises}, score=${currentGoal.score}%`);
                } catch (err) {
                    console.error('[API] Error calculating dynamic topic progress:', err);
                }
            }

            let mostFrequentError = null;
            if (Array.isArray(userErrors) && userErrors.length > 0) {
                // Sort descending by contador
                const sortedErrors = [...userErrors].sort((a, b) => (b.contador || 0) - (a.contador || 0));
                const topError = sortedErrors[0];
                if (topError && topError.error_id) {
                    try {
                        const details = await api.getErrorDetails(topError.error_id);
                        if (details) {
                            mostFrequentError = {
                                nombre: details.nombre,
                                descripcion: details.descripcion,
                                tipo: details.tipo,
                                contador: topError.contador
                            };
                        }
                    } catch (e) {
                        console.error('[API] Error resolving top error details:', e);
                    }
                }
            }

            return {
                user: { ...user, stats },
                sessions,
                currentGoal,
                mostFrequentError
            };
        } catch (error) {
            console.error('[API] Error fetching dashboard data:', error);
            return { user, sessions: [], currentGoal: null, mostFrequentError: null };
        }
    },
    
    getExercises: async () => {
        const url = `${BASE_URL}/api/exercises`;
        console.log(`[API] Fetching exercises from: ${url}`);
        try {
            const response = await fetch(url);
            console.log(`[API] Exercises Response Status: ${response.status}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[API] Failed to fetch exercises. Status: ${response.status}, Error: ${errorText}`);
                throw new Error('Failed to fetch exercises');
            }
            
            const data = await response.json();
            console.log(`[API] Received data from server:`, data);
            
            if (!Array.isArray(data)) {
                console.error('[API] Expected array of exercises but received:', typeof data);
                return [];
            }
            
            console.log(`[API] Mapping ${data.length} exercises.`);
            
            return data.map(ex => ({
                id: ex.id,
                title: ex.titulo,
                difficulty: ex.dificultad,
                category: "General",
                description: ex.descripcion,
                entrance: ex.entrada,
                exit: ex.salida,
                examples: ex.ejemplos,
                requirements: ex.requisitos,
                testCases: ex.casos_prueba,
                topic_id: ex.topic_id,
                time: "30 mins",
                completed: false
            }));
        } catch (error) {
            console.error('[API] Critical Error in getExercises:', error);
            return [];
        }
    },
    
    getConversations: async (usuario_id) => {
        try {
            const response = await fetch(`${BASE_URL}/api/conversations?usuario_id=${usuario_id}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching conversations:', error);
            return [];
        }
    },
    
    createConversation: async (usuario_id, titulo = null) => {
        try {
            const response = await fetch(`${BASE_URL}/api/conversations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario_id, titulo })
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating conversation:', error);
            return null;
        }
    },
    
    deleteConversation: async (id) => {
        try {
            const response = await fetch(`${BASE_URL}/api/conversations/${id}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error('Error deleting conversation:', error);
            return null;
        }
    },
    
    updateConversation: async (id, data) => {
        try {
            const response = await fetch(`${BASE_URL}/api/conversations/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating conversation:', error);
            return null;
        }
    },
    
    getChatMessages: async (conversacion_id) => {
        try {
            const response = await fetch(`${BASE_URL}/api/chat?conversacion_id=${conversacion_id}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching chat messages:', error);
            return [];
        }
    },
    
    saveChatMessage: async (usuario_id, conversacion_id, mensaje, respuesta) => {
        console.log('[API] saving message:', { usuario_id, conversacion_id, mensaje: mensaje.substring(0, 20) + '...' });
        try {
            const response = await fetch(`${BASE_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario_id, conversacion_id, mensaje, respuesta })
            });
            return await response.json();
        } catch (error) {
            console.error('Error saving chat message:', error);
            return null;
        }
    },
    
    getChatHistory: async () => {
        return []; // Mantener por compatibilidad si es necesario, pero preferir getChatMessages
    },
    
    getProgress: async () => {
        return {
            mastery: 0,
            breakdown: [],
            modules: []
        };
    },
    
    getExerciseById: async (id) => {
        try {
            const response = await fetch(`${BASE_URL}/api/exercises/${id}`);
            if (!response.ok) {
                // Fallback: fetch all and find
                const all = await api.getExercises();
                const found = all.find(e => e.id == id);
                if (found) return found;
                throw new Error('Failed to fetch exercise');
            }
            const ex = await response.json();
            
            // Handle case where API might return an array with 1 item or direct object
            const data = Array.isArray(ex) ? ex[0] : ex;

            return {
                id: data.id,
                title: data.titulo,
                difficulty: data.dificultad,
                category: "General",
                description: data.descripcion,
                entrance: data.entrada,
                exit: data.salida,
                examples: data.ejemplos,
                requirements: data.requisitos,
                testCases: data.casos_prueba,
                topic_id: data.topic_id,
                time: "30 mins",
                completed: false
            };
        } catch (error) {
            console.error('API Error:', error);
            // Last resort: check if we can find it in all exercises
            const all = await api.getExercises();
            return all.find(e => e.id == id) || null;
        }
    },
    executeCode: async (code, language, input = '') => {
        try {
            console.log(`[API] Executing ${language} code...`);
            const response = await fetch(`${BASE_URL}/api/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language, input })
            });
            const data = await response.json();
            console.log('[API] Server response:', data);
            return data;
        } catch (error) {
            console.error('[API] Execution request failed:', error);
            return { status: 'error', message: error.message };
        }
    },
    
    recordException: async (stderr, language, userId) => {
        try {
            console.log(`[API] Recording exception... User: ${userId}, Lang: ${language}`);
            const response = await fetch(`${BASE_URL}/api/record_exception`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stderr, language, userId })
            });
            return await response.json();
        } catch (error) {
            console.error('[API] Record exception request failed:', error);
            return { status: 'error', message: error.message };
        }
    },
    
    getExerciseProgress: async (user_id) => {
        try {
            const response = await fetch(`${BASE_URL}/api/user_ejer?user_id=${user_id}`);
            return await response.json();
        } catch (error) {
            console.error('[API] Error fetching exercise progress:', error);
            return [];
        }
    },
    
    saveExerciseProgress: async (user_id, ejer_id, envio, estado) => {
        try {
            const response = await fetch(`${BASE_URL}/api/user_ejer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id, ejer_id, envio, estado })
            });
            return await response.json();
        } catch (error) {
            console.error('[API] Error saving exercise progress:', error);
            return null;
        }
    },
    
    getAIResponse: async (systemInstruction, message, history = []) => {
        try {
            const response = await fetch(`${BASE_URL}/api/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ systemInstruction, message, history })
            });
            if (!response.ok) throw new Error('AI API request failed');
            return await response.json();
        } catch (error) {
            console.error('[API] Error getting AI response:', error);
            return null;
        }
    },
    
    updateUserTopicProgress: async (userId, topicId) => {
        try {
            console.log(`[API] Updating progress for user ${userId} on topic ${topicId}`);
            
            // 1. Check if record exists
            const res = await fetch(`${BASE_URL}/api/progreso_usuario?usuario_id=eq.${userId}&topic_id=eq.${topicId}`);
            const data = await res.json();
            
            if (data && data.length > 0) {
                const record = data[0];
                const newScore = (record.score || 0) + 1;
                
                // 2. Update existing record
                console.log(`[API] Incrementing score to ${newScore} for record ${record.id}`);
                await fetch(`${BASE_URL}/api/progreso_usuario?id=eq.${record.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        score: newScore,
                        updated_at: new Date().toISOString()
                    })
                });
            } else {
                // 3. Create new record
                console.log(`[API] Creating new progress record for topic ${topicId}`);
                await fetch(`${BASE_URL}/api/progreso_usuario`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        usuario_id: userId, 
                        topic_id: topicId, 
                        nivel: 1, 
                        score: 1 
                    })
                });
            }
        } catch (error) {
            console.error('[API] Error updating topic progress:', error);
        }
    }
};

window.api = api;
