import { ExampleService } from './ExampleService';

async function main() {
    const service = new ExampleService();
    await service.start();
}

main().catch(error => {
    console.error('Failed to start example service:', error);
    process.exit(1);
});