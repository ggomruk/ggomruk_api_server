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
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserDTO } from 'src/domain/user/dto/user.dto';
import { LoginDTO } from './dto/login.dto';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { Public } from './decorators/public.decorator';
import { GeneralResponse } from 'src/common/dto/general-response.dto';
import { ConfigService } from '@nestjs/config';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user with username and password',
  })
  @ApiBody({ type: LoginDTO })
  @ApiResponse({
    status: 200,
    description: 'Login successful, returns access token and refresh token',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Request() req, @Body() loginDto: LoginDTO) {
    const result = await this.authService.login(req.user);
    this.logger.log(`User logged in successfully: ${req.user.username}`);
    return GeneralResponse.success(result, 'Login successful');
  }

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'User registration',
    description: 'Create a new user account',
  })
  @ApiBody({ type: UserDTO })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or username already exists',
  })
  async signup(@Body() userDto: UserDTO) {
    const result = await this.authService.signup(userDto);
    this.logger.log(`User signed up successfully: ${userDto.username}`);
    return GeneralResponse.success(result, 'Account created successfully');
  }

  @Post('signout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'User logout',
    description: 'Logout the authenticated user',
  })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Request() req) {
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

      // Use ConfigService instead of process.env directly
      const frontendUrl =
        this.configService.get<string>('app.frontendUrl') ||
        'http://localhost:3000';

      // Set token in httpOnly cookie for security (better than URL)
      res.cookie('auth_token', result.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.redirect(`${frontendUrl}/auth/callback`);
    } catch (error) {
      this.logger.error(`Google OAuth error: ${error.message}`);
      const frontendUrl =
        this.configService.get<string>('app.frontendUrl') ||
        'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/error?message=authentication_failed`);
    }
  }

  @Public()
  @Get('exchange-token')
  @ApiOperation({
    summary: 'Exchange auth cookie for token',
    description:
      'Exchange the httpOnly auth_token cookie for a JWT token (used after OAuth redirect)',
  })
  @ApiResponse({ status: 200, description: 'Token exchanged successfully' })
  @ApiResponse({ status: 401, description: 'No auth cookie found or invalid' })
  async exchangeToken(@Req() req, @Res() res: Response) {
    const authToken = req.cookies?.auth_token;

    if (!authToken) {
      throw new Error('No authentication token found in cookies');
    }

    // Clear the cookie after reading it (one-time use)
    res.cookie('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
    });

    return GeneralResponse.success(
      { access_token: authToken },
      'Token exchanged successfully',
    );
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Retrieve authenticated user profile information',
  })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req) {
    return GeneralResponse.success(req.user, 'Profile retrieved successfully');
  }

  @Get('verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Verify JWT token',
    description: 'Check if the JWT token is valid',
  })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  async verifyToken(@Request() req) {
    return GeneralResponse.success(
      { valid: true, user: req.user },
      'Token is valid',
    );
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Get a new access token using refresh token',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refresh_token: { type: 'string', description: 'Refresh token' },
      },
      required: ['refresh_token'],
    },
  })
  @ApiResponse({ status: 200, description: 'New access token generated' })
  @ApiResponse({ status: 400, description: 'Refresh token is required' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
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
