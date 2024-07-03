import {
  Controller,
  Delete,
  Post,
  Put,
  Logger,
  UseFilters,
  HttpStatus,
} from '@nestjs/common';
import { UserExceptionFilter } from './user.exceptionFilter';
import { UserException, UserExceptionCode } from './user.exception';

@Controller('/api/user')
@UseFilters(UserExceptionFilter)
export class UserController {
  private readonly logger = new Logger(UserController.name);

  @Post('login')
  signin() {
    throw new UserException(
      UserExceptionCode.INVALID_CREDENTIALS,
      'Invalid username or password',
      HttpStatus.BAD_REQUEST,
    );
  }

  @Post('signout')
  signout() {}

  @Post('signup')
  signup() {}

  @Put('update')
  udpateUserInfo() {}

  @Delete('delete')
  deleteUser() {}
}
