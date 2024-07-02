export default () => ({
  database: {
    prod: {
      host: process.env.DB_HOST,
      port: 27017,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      dbName: process.env.DB_NAME,
    },
    dev: {
      host: process.env.DB_HOST || 'localhost',
      port: 27017,
      dbName: process.env.DB_NAME,
    },
  },
  rabbitMQ: {
    prod: {
      host: process.env.RABBITMQ_HOST,
      port: 5672,
      username: process.env.RABBITMQ_USERNAME,
      password: process.env.RABBITMQ_PASSWORD,
    },
    dev: {
      host: process.env.RABBITMQ_HOST || 'localhost',
      port: 5672,
      username: process.env.RABBITMQ_USERNAME || 'guest',
      password: process.env.RABBITMQ_PASSWORD || 'guest',
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
});
