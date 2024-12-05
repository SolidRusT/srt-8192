import { ExampleService } from './ExampleService';
import axios from 'axios';
import { HealthStatus } from '@srt-8192/service-base';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ExampleService', () => {
    let service: ExampleService;

    beforeEach(() => {
        service = new ExampleService();
        // Reset axios mocks
        mockedAxios.get.mockReset();
    });

    describe('Health Checks', () => {
        it('should return healthy status when all dependencies are up', async () => {
            // Mock successful health checks
            mockedAxios.get.mockResolvedValueOnce({ status: 200 }); // user service
            mockedAxios.get.mockResolvedValueOnce({ status: 200 }); // notification service

            await service.init();
            const health = await service['getHealthStatus']();

            expect(health.status).toBe(HealthStatus.Healthy);
            expect(health.dependencies['user-service']).toBe(HealthStatus.Healthy);
            expect(health.dependencies['notification-service']).toBe(HealthStatus.Healthy);
        });

        it('should return degraded status when non-critical dependency is down', async () => {
            // Mock user service up, notification service down
            mockedAxios.get.mockResolvedValueOnce({ status: 200 }); // user service
            mockedAxios.get.mockRejectedValueOnce(new Error('Connection failed')); // notification service

            await service.init();
            const health = await service['getHealthStatus']();

            expect(health.status).toBe(HealthStatus.Degraded);
            expect(health.dependencies['user-service']).toBe(HealthStatus.Healthy);
            expect(health.dependencies['notification-service']).toBe(HealthStatus.Unhealthy);
        });

        it('should return unhealthy status when critical dependency is down', async () => {
            // Mock user service down
            mockedAxios.get.mockRejectedValueOnce(new Error('Connection failed')); // user service
            mockedAxios.get.mockResolvedValueOnce({ status: 200 }); // notification service

            await service.init();
            const health = await service['getHealthStatus']();

            expect(health.status).toBe(HealthStatus.Unhealthy);
            expect(health.dependencies['user-service']).toBe(HealthStatus.Unhealthy);
        });
    });

    describe('API Endpoints', () => {
        it('should return success message from /api/example', async () => {
            await service.init();
            
            // Get the express app from the service
            const app = service['app'];
            
            // Create a test request
            const response = await new Promise((resolve) => {
                app.listen(0, () => {
                    axios.get('http://localhost:' + app.address().port + '/api/example')
                        .then(resolve);
                });
            });

            expect(response['data']).toHaveProperty('message', 'Example service is running');
            expect(response['data']).toHaveProperty('timestamp');
        });

        it('should handle errors properly', async () => {
            await service.init();
            const app = service['app'];

            try {
                await new Promise((resolve, reject) => {
                    app.listen(0, () => {
                        axios.get('http://localhost:' + app.address().port + '/api/example/error')
                            .then(resolve)
                            .catch(reject);
                    });
                });
            } catch (error) {
                expect(error.response.status).toBe(500);
            }
        });
    });
});