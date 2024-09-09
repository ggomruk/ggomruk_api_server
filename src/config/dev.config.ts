export default () => ({
  database: {
    host: process.env.DB_HOST,
    port: 27017,
    dbName: process.env.DB_NAME,
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
