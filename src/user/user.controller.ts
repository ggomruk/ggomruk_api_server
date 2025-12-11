import {
  Delete,
  Put,
  Logger,
  UseFilters,
  Controller,
  Get,
  Post,
  Body,
} from '@nestjs/common';
import { UserExceptionFilter } from './user.exceptionFilter';
import { UserValidationPipe } from './user.validation';
import { UserDTO } from './dto/user.dto';
import { UserException } from './user.exception';
import { UserService } from './user.service';

@Controller('user')
@UseFilters(UserExceptionFilter)
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Post('create')
  async createUser(@Body(new UserValidationPipe()) userDTO: UserDTO) {
    try {
      console.log(userDTO)
      const result = await this.userService.createUser(userDTO);
      return { ok: 1, result };
    } catch(err) {
      let errorResponse = err.response;
      if (err instanceof UserException) {
        return { ok: 0, error: err.message, code: errorResponse.code };
      }
      return { ok: 0, error: err.message };
    }

  }

  @Get('')
  getUser() {}

  @Get('userlist')
  getUserList() {}

  @Put('update')
  udpateUserInfo() {}

  @Delete('delete')
  deleteUser() {}
}
