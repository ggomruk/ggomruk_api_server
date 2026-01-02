import { registerAs } from '@nestjs/config';

interface IWsConfig {
  wsUrl: string;
  wsPort: string;
}

export default registerAs<IWsConfig>('websocket', () => ({
  wsUrl: process.env.WS_URL,
  wsPort: process.env.WS_PORT,
}));

export { IWsConfig };
