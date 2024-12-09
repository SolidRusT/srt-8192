const http = require('http');
const chalk = require('chalk');

// Service configuration
const services = [
    { name: 'Frontend', port: 3000, path: '/api/health' },
    { name: 'API Gateway', port: 5000, path: '/health' },
    { name: 'Game Logic', port: 5001, path: '/health' },
    { name: 'AI Service', port: 5002, path: '/health' },
    { name: 'Data Integration', port: 5003, path: '/health' },
    { name: 'Economy', port: 5004, path: '/health' },
    { name: 'Leaderboard', port: 5005, path: '/health' },
    { name: 'Matchmaking', port: 5006, path: '/health' },
    { name: 'Notifications', port: 5007, path: '/health' },
    { name: 'Persistence', port: 5008, path: '/health' },
    { name: 'Rewards', port: 5009, path: '/health' },
    { name: 'Social', port: 5010, path: '/health' },
    { name: 'Tutorial', port: 5011, path: '/health' },
    { name: 'User', port: 5012, path: '/health' }
];

async function checkHealth(service) {
    return new Promise((resolve) => {
        const req = http.get({
            hostname: 'localhost',
            port: service.port,
            path: service.path,
            timeout: 5000
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                resolve({
                    service: service.name,
                    status: res.statusCode === 200 ? 'healthy' : 'unhealthy',
                    statusCode: res.statusCode,
                    data: data
                });
            });
        });

        req.on('error', () => {
            resolve({
                service: service.name,
                status: 'unreachable',
                statusCode: 0,
                data: null
            });
        });
    });
}

async function checkAllServices() {
    console.log(chalk.blue.bold('\nChecking service health...\n'));

    const results = await Promise.all(services.map(checkHealth));
    let allHealthy = true;

    results.forEach(result => {
        const status = result.status === 'healthy' 
            ? chalk.green('✓ healthy')
            : result.status === 'unhealthy'
                ? chalk.yellow('⚠ unhealthy')
                : chalk.red('✗ unreachable');

        console.log(`${chalk.bold(result.service.padEnd(20))} ${status}`);
        
        if (result.status !== 'healthy') {
            allHealthy = false;
        }
    });

    console.log('\n' + chalk.blue.bold('Health check complete!'));
    
    if (!allHealthy) {
        console.log(chalk.yellow('\nSome services are not healthy. Check individual service logs for more details.'));
        process.exit(1);
    }
}

checkAllServices().catch(error => {
    console.error(chalk.red('Error during health check:', error));
    process.exit(1);
});