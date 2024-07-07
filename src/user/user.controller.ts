import {
  Delete,
  Put,
  Logger,
  UseFilters,
  Controller,
  Get,
} from '@nestjs/common';
import { UserExceptionFilter } from './user.exceptionFilter';

@Controller('/api/user')
@UseFilters(UserExceptionFilter)
export class UserController {
  private readonly logger = new Logger(UserController.name);

  @Get('')
  getUser() {}

  @Get('userlist')
  getUserList() {}

  @Put('update')
  udpateUserInfo() {}

  @Delete('delete')
  deleteUser() {}
}
