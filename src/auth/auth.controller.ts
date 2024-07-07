import { Controller, Get, Post } from '@nestjs/common';

@Controller('/api/auth')
export class AuthController {
  constructor() {}

  @Post('login')
  login() {}

  @Post('signout')
  logout() {}

  @Post('signup')
  signup() {}

  @Get('/google')
  google() {}
}
