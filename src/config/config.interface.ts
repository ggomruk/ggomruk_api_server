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
    retry: number;
    delay: number;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  websocket: {
    wsUrl: string;
    wsPort: string;
  }
}
