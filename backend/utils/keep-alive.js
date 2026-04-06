export function keepAlive(url) {
    setInterval(() => {
        try {
            fetch(url).catch(() => {
                // Silently fail - just for keeping server alive
            });
        } catch (error) {
            // Silently fail - just for keeping server alive
        }
    }, 5 * 60 * 1000); // Every 5 minutes
}
