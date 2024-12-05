// Set up test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '5000';
process.env.SERVICE_NAME = 'example-service';
process.env.LOG_LEVEL = 'error';
process.env.USER_SERVICE_URL = 'http://localhost:5012';
process.env.NOTIFICATION_SERVICE_URL = 'http://localhost:5007';