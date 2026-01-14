import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/domain/user/user.module';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategy/local.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';
import { GoogleStrategy } from './strategy/google.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

/**
 * 🔐 AuthModule - Authentication & Authorization
 *
 * @description Handles user authentication via JWT and Google OAuth
 *
 * @controllers
 * - AuthController: POST /auth/signup, /auth/login, GET /auth/profile
 *
 * @services
 * - AuthService: Authentication business logic
 * - UserService: User data access (imported from UserModule)
 *
 * @guards
 * - JwtAuthGuard: Global JWT token validation
 * - LocalAuthGuard: Username/password authentication
 * - GoogleAuthGuard: Google OAuth authentication
 *
 * @strategies
 * - LocalStrategy: Passport local authentication
 * - JwtStrategy: Passport JWT authentication
 * - GoogleStrategy: Passport Google OAuth (optional)
 *
 * @dependencies
 * - UserModule: Required for user management
 * - JwtModule: Required for JWT token generation
 * - PassportModule: Required for authentication strategies
 */
@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('auth.jwtAccessSecret'),
        signOptions: {
          expiresIn: configService.get<string>(
            'auth.jwtAccessExpiresIn',
          ) as any,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, GoogleStrategy],
  exports: [AuthService],
})
export class AuthModule {}
