/**
 * Mock API Service for DeepTutor
 * Centralizes all data to remove hardcoded strings from views.
 */

const mockData = {
    user: {
        name: "Developer",
        path: "Python Backend",
        stats: {
            studyTime: 42,
            exercisesDone: 84,
            streak: 12,
            level: 24
        },
        nextLevelXP: "450 XP"
    },
    sessions: [
        { id: 1, title: "Data Structures: Linked Lists", date: "Today", duration: "45 mins", type: "exercise", difficulty: "Intermediate", icon: "data_object", color: "tertiary" },
        { id: 2, title: "REST API Design with Fast API", date: "Yesterday", duration: "1.5 hours", type: "chat", difficulty: "Advanced", icon: "api", color: "primary" }
    ],
    exercises: [
        { 
            id: "two-sum", 
            title: "Two Sum", 
            difficulty: "Beginner", 
            category: "Arrays", 
            description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
            time: "15 mins",
            completed: true
        },
        { 
            id: "reverse-linked-list", 
            title: "Reverse Linked List", 
            difficulty: "Intermediate", 
            category: "Linked List", 
            description: "Given the head of a singly linked list, reverse the list, and return the reversed list. Implement both iterative and recursive solutions.",
            time: "30 mins",
            completed: false
        },
        { 
            id: "binary-tree-traversal", 
            title: "Binary Tree Level Order Traversal", 
            difficulty: "Intermediate", 
            category: "Trees", 
            description: "Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).",
            time: "45 mins",
            completed: false
        }
    ],
    chatHistory: [
        { role: "user", content: "I'm trying to understand how to implement a basic React hook for fetching data. Can you show me an example?", time: "2:45 PM" },
        { 
            role: "assistant", 
            content: "Certainly! A custom React hook for data fetching is a great way to encapsulate state and side effects. Here's a structured approach to building a robust useFetch hook.",
            time: "2:46 PM",
            code: "import { useState, useEffect } from 'react';\n\nexport const useFetch = (url) => {\n  const [data, setData] = useState(null);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState(null);\n\n  useEffect(() => {\n    let isMounted = true;\n    const fetchData = async () => {\n      try {\n        const res = await fetch(url);\n        const json = await res.json();\n        if (isMounted) setData(json);\n      } catch (err) {\n        if (isMounted) setError(err);\n      } finally {\n        if (isMounted) setLoading(false);\n      }\n    };\n    fetchData();\n    return () => { isMounted = false; };\n  }, [url]);\n\n  return { data, loading, error };\n};"
        }
    ],
    progress: {
        mastery: 75,
        breakdown: [
            { name: "Python Core", percentage: 90, color: "primary" },
            { name: "Algorithms", percentage: 65, color: "tertiary" },
            { name: "Web Backend", percentage: 40, color: "secondary" }
        ],
        modules: [
            { id: 1, name: "Language Fundamentals", status: "completed", desc: "Variables, loops, and basic data types." },
            { id: 2, name: "Advanced Data Structures", status: "completed", desc: "Dictionaries, sets, and complex lists." },
            { id: 3, name: "Object Oriented Programming", status: "active", desc: "Classes, inheritance, and decorators." },
            { id: 4, name: "Database Integration", status: "locked", desc: "SQLAlchemy and PostgreSQL basics." }
        ]
    }
};

export const api = {
    getUser: () => Promise.resolve(mockData.user),
    getSessions: () => Promise.resolve(mockData.sessions),
    getExercises: () => Promise.resolve(mockData.exercises),
    getChatHistory: () => Promise.resolve(mockData.chatHistory),
    getProgress: () => Promise.resolve(mockData.progress),
    getExerciseById: (id) => Promise.resolve(mockData.exercises.find(e => e.id === id))
};
