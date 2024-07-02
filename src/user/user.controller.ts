import { Controller, Delete, Post, Put, Logger } from '@nestjs/common';

@Controller('/api/user')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  @Post('signin')
  signin() {}

  @Post('signout')
  signout() {}

  @Post('signup')
  signup() {}

  @Put('update')
  udpateUserInfo() {}

  @Delete('delete')
  deleteUser() {}
}
