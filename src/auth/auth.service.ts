import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.schema';
import { UserDTO } from 'src/user/dto/user.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findUser(username);
    if (!user) {
      this.logger.warn(`User not found: ${username}`);
      return null;
    }

    const isPasswordValid = await this.userService.validatePassword(user, password);
    if (isPasswordValid) {
      const { password, ...result } = user.toObject();
      return result;
    }
    
    this.logger.warn(`Invalid password for user: ${username}`);
    return null;
  }

  async login(user: any) {
    const payload = { 
      username: user.username, 
      sub: user._id,
      email: user.email 
    };
    
    // Generate access token (uses JwtModule config)
    const access_token = this.jwtService.sign(payload);
    
    // Generate refresh token with different secret and longer expiration
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('auth.jwtRefreshSecret'),
      expiresIn: this.configService.get<string>('auth.jwtRefreshExpiresIn'),
    });
    
    this.logger.log(`User logged in: ${user.username}`);
    
    return {
      access_token,
      refresh_token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        picture: user.picture,
      },
    };
  }

  async signup(userDto: UserDTO) {
    try {
      const user = await this.userService.createUser(userDto);
      const { password, ...result } = user.toObject();
      
      this.logger.log(`New user registered: ${user.username}`);
      
      return this.login(result);
    } catch (error) {
      this.logger.error(`Signup error: ${error.message}`);
      throw error;
    }
  }

  async googleLogin(req: any) {
    if (!req.user) {
      throw new UnauthorizedException('No user from Google');
    }

    const user = await this.userService.createOrUpdateGoogleUser(req.user);
    const { password, ...result } = user.toObject();
    
    this.logger.log(`Google OAuth login: ${user.email}`);
    
    return this.login(result);
  }

  async validateToken(token: string): Promise<any> {
    try {
      const decoded = this.jwtService.verify(token);
      return decoded;
    } catch (error) {
      this.logger.error(`Token validation error: ${error.message}`);
      return null;
    }
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      // Verify refresh token with refresh secret
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('auth.jwtRefreshSecret'),
      });

      // Find user to ensure they still exist
      const user = await this.userService.findUser(payload.username);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new access token
      const newPayload = {
        username: payload.username,
        sub: payload.sub,
        email: payload.email,
      };

      const access_token = this.jwtService.sign(newPayload);

      this.logger.log(`Access token refreshed for user: ${payload.username}`);

      return {
        access_token,
      };
    } catch (error) {
      this.logger.error(`Refresh token error: ${error.message}`);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
