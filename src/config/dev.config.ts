export default () => ({
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: 27017,
    dbName: process.env.DB_NAME,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
});
