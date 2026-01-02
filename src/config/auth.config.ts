import { registerAs } from '@nestjs/config';

interface IAuthConfig {
  // JWT Access + Refresh Token
  jwtAccessSecret: string;
  jwtAccessExpiresIn: string;
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn: string;

  // Google OAuth
  // googleClientID: string;
  // googleClientSecret: string;
  // googleCallbackURL: string;
}

export default registerAs<IAuthConfig>('auth', () => ({
  // JWT Access + Refresh Token
  jwtAccessSecret: process.env.JWT_SECRET,
  jwtAccessExpiresIn: process.env.JWT_EXPIRES_IN,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,

  // Google OAuth
  // googleClientID: process.env.GOOGLE_CLIENT_ID,
  // googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  // googleCallbackURL: process.env.GOOGLE_CALLBACK_URL,
}));

export { IAuthConfig };
