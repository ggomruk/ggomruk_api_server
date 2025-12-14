import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  UseGuards, 
  Request, 
  HttpCode, 
  HttpStatus,
  Logger,
  Res,
  Req
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserDTO } from 'src/user/dto/user.dto';
import { LoginDTO } from './dto/login.dto';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { Public } from './decorators/public.decorator';
import { GeneralResponse } from 'src/common/dto/general-response.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(@Request() req, @Body() loginDto: LoginDTO) {
    const result = await this.authService.login(req.user);
    this.logger.log(`User logged in successfully: ${req.user.username}`);
    return GeneralResponse.success(result, 'Login successful');
  }

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() userDto: UserDTO) {
    const result = await this.authService.signup(userDto);
    this.logger.log(`User signed up successfully: ${userDto.username}`);
    return GeneralResponse.success(result, 'Account created successfully');
  }

  @Post('signout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req) {
    // JWT is stateless, so we just return success
    // Client should remove the token from storage
    this.logger.log(`User logged out: ${req.user.username}`);
    return GeneralResponse.success(null, 'Logged out successfully');
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Request() req) {
    // Guard redirects to Google
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Request() req, @Res() res: Response) {
    try {
      const result = await this.authService.googleLogin(req);
      
      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/callback?token=${result.access_token}`);
    } catch (error) {
      this.logger.error(`Google OAuth error: ${error.message}`);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/error?message=${error.message}`);
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return GeneralResponse.success(req.user, 'Profile retrieved successfully');
  }

  @Get('verify')
  @UseGuards(JwtAuthGuard)
  async verifyToken(@Request() req) {
    return GeneralResponse.success({ valid: true, user: req.user }, 'Token is valid');
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body('refresh_token') refreshToken: string) {
    try {
      if (!refreshToken) {
        return { ok: 0, error: 'Refresh token is required' };
      }
      
      const result = await this.authService.refreshAccessToken(refreshToken);
      return { ok: 1, data: result };
    } catch (error) {
      this.logger.error(`Refresh token error: ${error.message}`);
      return { ok: 0, error: error.message };
    }
  }
}
