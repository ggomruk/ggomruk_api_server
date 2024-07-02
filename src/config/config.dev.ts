export default () => ({
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: 27017,
    dbName: process.env.DB_NAME,
  },
  rabbitMq: {
    host: process.env.RABBITMQ_HOST || 'localhost',
    port: 5672,
    username: process.env.RABBITMQ_USERNAME || 'guest',
    password: process.env.RABBITMQ_PASSWORD || 'guest',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
});
