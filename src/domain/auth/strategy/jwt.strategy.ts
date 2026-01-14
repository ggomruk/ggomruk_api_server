import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const jwtSecret =
      configService.get('auth.jwtAccessSecret') || process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error(
        'JWT_SECRET is required. Please set JWT_SECRET environment variable.',
      );
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      username: payload.username,
      email: payload.email,
    };
  }
}
