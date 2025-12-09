import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.schema';
import { UserDTO } from 'src/user/dto/user.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
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
    
    const access_token = this.jwtService.sign(payload);
    
    this.logger.log(`User logged in: ${user.username}`);
    
    return {
      access_token,
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
}
