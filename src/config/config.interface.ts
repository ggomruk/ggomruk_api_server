export interface IConfig {
  database: {
    host: string;
    port: number;
    username?: string;
    password?: string;
    dbName: string;
  };
  redis: {
    host: string;
    port: number;
    username: string;
    password: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
}
