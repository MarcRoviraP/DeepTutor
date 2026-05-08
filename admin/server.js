const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 5005;
const API_BASE_URL = 'http://68.221.175.191:5001';
const FILE_PATH = path.join(__dirname, 'index.html');

const server = http.createServer((req, res) => {
    // 1. Manejo del Proxy para evitar CORS
    if (req.url.startsWith('/api-proxy/')) {
        const targetPath = req.url.replace('/api-proxy/', '');
        const targetUrl = `${API_BASE_URL}/${targetPath}`;

        console.log(`[Proxy] Reenviando petición a: ${targetUrl}`);

        const proxyReq = http.request(targetUrl, {
            method: req.method,
            headers: {
                ...req.headers,
                host: '68.221.175.191:5001' // Forzar el host de destino
            }
        }, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res, { end: true });
        });

        proxyReq.on('error', (err) => {
            console.error('[Error de Proxy]', err.message);
            res.writeHead(500);
            res.end(`Error en el proxy: ${err.message}`);
        });

        req.pipe(proxyReq, { end: true });
        return;
    }

    // 2. Servir el index.html
    fs.readFile(FILE_PATH, (err, data) => {
        if (err) {
            res.writeHead(500);
            return res.end('Error cargando el panel de admin');
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
    });
});

server.listen(PORT, () => {
    const url = `http://localhost:${PORT}`;
    console.log(`\x1b[36m%s\x1b[0m`, `-----------------------------------------`);
    console.log(`🚀 Proxy del Panel de Admin de DeepTutor corriendo en: ${url}`);
    console.log(`\x1b[33m%s\x1b[0m`, `(Bypass de CORS activo vía /api-proxy/)`);
    console.log(`\x1b[36m%s\x1b[0m`, `-----------------------------------------`);
    
    const platform = process.platform;
    const cmd = platform === 'win32' ? `start ${url}` : (platform === 'darwin' ? `open ${url}` : `xdg-open ${url}`);
    
    exec(cmd, (err) => {
        if (err) {
            console.log('No se pudo abrir el navegador automáticamente. Por favor, abre la URL manualmente.');
        }
    });
});
