const { exec } = require('child_process');
const chalk = require('chalk');

function checkMongoDB() {
    return new Promise((resolve) => {
        exec('docker exec $(docker ps -q -f name=mongodb) mongosh --eval "db.adminCommand(\'ping\')"', (error, stdout, stderr) => {
            if (error) {
                resolve({
                    name: 'MongoDB',
                    status: 'unreachable',
                    error: stderr || error.message
                });
                return;
            }
            resolve({
                name: 'MongoDB',
                status: stdout.includes('ok: 1') ? 'healthy' : 'unhealthy',
                data: stdout
            });
        });
    });
}

function checkRedis() {
    return new Promise((resolve) => {
        exec('docker exec $(docker ps -q -f name=redis) redis-cli ping', (error, stdout, stderr) => {
            if (error) {
                resolve({
                    name: 'Redis',
                    status: 'unreachable',
                    error: stderr || error.message
                });
                return;
            }
            resolve({
                name: 'Redis',
                status: stdout.trim() === 'PONG' ? 'healthy' : 'unhealthy',
                data: stdout
            });
        });
    });
}

async function checkDatabases() {
    console.log(chalk.blue.bold('\nChecking database health...\n'));

    const results = await Promise.all([
        checkMongoDB(),
        checkRedis()
    ]);

    let allHealthy = true;

    results.forEach(result => {
        const status = result.status === 'healthy'
            ? chalk.green('✓ healthy')
            : result.status === 'unhealthy'
                ? chalk.yellow('⚠ unhealthy')
                : chalk.red('✗ unreachable');

        console.log(`${chalk.bold(result.name.padEnd(20))} ${status}`);
        
        if (result.status !== 'healthy') {
            allHealthy = false;
            if (result.error) {
                console.log(chalk.red(`  Error: ${result.error}`));
            }
        }
    });

    console.log('\n' + chalk.blue.bold('Database health check complete!'));

    if (!allHealthy) {
        console.log(chalk.yellow('\nSome databases are not healthy. Check container logs for more details.'));
        process.exit(1);
    }
}

checkDatabases().catch(error => {
    console.error(chalk.red('Error during database check:', error));
    process.exit(1);
});