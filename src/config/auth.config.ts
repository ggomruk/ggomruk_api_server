import { registerAs } from '@nestjs/config';

interface IAuthConfig {
  // JWT Access + Refresh Token
  jwtAccessSecret: string;
  jwtAccessExpiresIn: string;
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn: string;

  // Google OAuth
  googleClientId: string;
  googleClientSecret: string;
  googleCallbackUrl: string;
}

export default registerAs<IAuthConfig>('auth', () => ({
  // JWT Access + Refresh Token
  jwtAccessSecret: process.env.JWT_SECRET,
  jwtAccessExpiresIn: process.env.JWT_EXPIRES_IN,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,

  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL,
}));

export { IAuthConfig };
