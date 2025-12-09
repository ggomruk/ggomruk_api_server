export default () => ({
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: 27017,
    dbName: process.env.DB_NAME || 'ggomruk',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: 6379,
    username: process.env.NODE_ENV == "prod" ? process.env.REDIS_USERNAME : "",
    password: process.env.NODE_ENV == "prod" ? process.env.REDIS_PASSWORD : "",
    retry: 5,
    delay: 1000,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback',
  },
  websocket: {
    wsUrl: process.env.WS_URL || 'ws://localhost',
    wsPort: process.env.WS_PORT || 8765,
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  }
});
