export default () => ({
  database: {
    host: process.env.DB_HOST || 'localhost',
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    port: 27017,
    dbName: process.env.DB_NAME,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
});
