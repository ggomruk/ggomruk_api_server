export default () => ({
  database: {
    host: process.env.DB_HOST,
    port: 27017,
    dbName: process.env.DB_NAME,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: 6379,
    username: process.env.NODE_ENV == "prod" ? process.env.REDIS_USERNAME : "",
    password: process.env.NODE_ENV == "prod" ? process.env.REDIS_PASSWORD : "",
    retry: 5,
    retryDelay: 1000,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  websocket: {
    wsUrl: process.env.WS_URL,
    wsPort: process.env.WS_PORT,
  }
});
