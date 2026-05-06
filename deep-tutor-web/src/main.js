import { router } from './router.js';

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

    // Initial navigation
    const initialRoute = window.location.hash.replace('#/', '') || 'dashboard';
    router.navigate(initialRoute, null, false);
});
