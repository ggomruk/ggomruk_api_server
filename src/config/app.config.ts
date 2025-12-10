import { registerAs } from "@nestjs/config";

interface IAppConfig {
    name: string;
    env: string;
    port: number;
    apiPrefix: string;
    apiVersion: string;
    clientUrl: string;
    analyticsUrl: string;
    corsOrigin: string[];
}

export default registerAs<IAppConfig>("app", () => ({
    name: process.env.APP_NAME,
    env: process.env.NODE_ENV,
    port: parseInt(process.env.PORT, 10),
    apiPrefix: process.env.API_PREFIX,
    apiVersion: process.env.API_VERSION,

    // URL
    clientUrl: process.env.CLIENT_URL,
    analyticsUrl: process.env.ANALYTICS_SERVER_URL,
    
    // Security
    corsOrigin: process.env.CORS_ORIGIN?.split(',')

}));

export { IAppConfig };