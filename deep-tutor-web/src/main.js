import { router } from './router.js';
import './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('DeepTutor SPA Initialized');
    
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
