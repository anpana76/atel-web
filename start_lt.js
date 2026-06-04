const localtunnel = require('localtunnel');

(async () => {
    try {
        const tunnel = await localtunnel({ port: 8080 });
        console.log("----------------------------------------");
        console.log("TUNNEL_URL:" + tunnel.url);
        console.log("----------------------------------------");
        
        tunnel.on('close', () => {
            console.log('Tunnel closed');
        });
    } catch (err) {
        console.error("Error starting tunnel:", err);
    }
})();
