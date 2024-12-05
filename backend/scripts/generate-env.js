const fs = require('fs').promises;
const path = require('path');

async function generateEnvFiles() {
    const servicesDir = path.join(__dirname, '..', 'services');
    const baseEnvPath = path.join(servicesDir, 'base', '.env.example');

    try {
        // Read base .env.example
        const baseEnv = await fs.readFile(baseEnvPath, 'utf8');

        // Get all service directories
        const services = await fs.readdir(servicesDir);

        for (const service of services) {
            if (service === 'base') continue;

            const serviceDir = path.join(servicesDir, service);
            const stat = await fs.stat(serviceDir);

            if (!stat.isDirectory()) continue;

            // Create development env
            const devEnvPath = path.join(serviceDir, '.env.development');
            let devEnv = baseEnv
                .replace('PORT=3000', `PORT=${getServicePort(service)}`)
                .replace('SERVICE_NAME=base-service', `SERVICE_NAME=${service}`);

            // Create production env
            const prodEnvPath = path.join(serviceDir, '.env.production');
            let prodEnv = devEnv
                .replace('NODE_ENV=development', 'NODE_ENV=production')
                .replace('ENABLE_DEBUGGING=true', 'ENABLE_DEBUGGING=false');

            // Create .env.example
            const exampleEnvPath = path.join(serviceDir, '.env.example');

            // Write files
            await fs.writeFile(devEnvPath, devEnv);
            await fs.writeFile(prodEnvPath, prodEnv);
            await fs.writeFile(exampleEnvPath, baseEnv);

            console.log(`Generated environment files for ${service}`);
        }
    } catch (error) {
        console.error('Error generating environment files:', error);
        process.exit(1);
    }
}

function getServicePort(service) {
    const portMap = {
        'game-logic-service': 5001,
        'ai-service': 5002,
        'data-integration': 5003,
        'economy-management': 5004,
        'leaderboard-service': 5005,
        'matchmaking-service': 5006,
        'notification-service': 5007,
        'persistence-service': 5008,
        'rewards-service': 5009,
        'social-service': 5010,
        'tutorial-service': 5011,
        'user-service': 5012
    };

    return portMap[service] || 3000;
}

generateEnvFiles().catch(console.error);