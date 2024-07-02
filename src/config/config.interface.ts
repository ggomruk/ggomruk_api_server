export interface IConfig {
  database: {
    host: string;
    port: number;
    username?: string;
    password?: string;
    dbName: string;
  };
  rabbitMq: {
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
