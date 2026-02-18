/**
 * Neural Prism Dynamic Router Middleware
 * 
 * Instructions:
 * 1. Import this into your main server file (e.g., app.js or server.js).
 * 2. Place app.use(subdomainRouter) BEFORE your standard static file serving.
 */

const path = require('path');

function subdomainRouter(req, res, next) {
    const host = req.get('host');
    
    // Ignore primary domain, www, and common dev/test environments
    const isPrimary = host === 'www.aivoicecast.com' || 
                      host === 'aivoicecast.com' || 
                      host.includes('localhost') || 
                      host.includes('.run.app'); // Cloud Run default URLs

    if (!isPrimary) {
        // If it's a subdomain request (e.g., check.aivoicecast.com)
        // serve the bridge.html file which handles the client-side redirect.
        return res.sendFile(path.join(__dirname, 'bridge.html'));
    }

    // Otherwise, proceed to main site logic
    next();
}

module.exports = subdomainRouter;