import { router } from './router.js';
import './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('DeepTutor SPA Initialized');
    
    // Set user avatar if picture is available
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        try {
            const user = JSON.parse(storedUser);
            if (user && user.picture) {
                const avatarDiv = document.getElementById('user-avatar');
                if (avatarDiv) {
                    avatarDiv.innerHTML = `<img src="${user.picture}" alt="${user.name || user.nombre || 'Usuario'}" class="w-full h-full object-cover">`;
                }
            }
        } catch (error) {
            console.error('Error parsing user from localStorage:', error);
        }
    }
    
    // Bind sidebar clicks
    document.querySelectorAll('[data-route]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const route = link.getAttribute('data-route');
            router.navigate(route);
        });
    });

    // Handle Logout
    const logoutBtn = document.getElementById('logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        });
    }

    // Initial navigation
    const fullRoute = window.location.hash.replace('#/', '');
    const parts = fullRoute.split('/');
    const route = parts[0] || 'dashboard';
    const id = parts[1];
    router.navigate(route, id ? { id } : null, false);
});
