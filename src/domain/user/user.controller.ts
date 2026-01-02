import {
  Delete,
  Put,
  Logger,
  Controller,
  Get,
  Post,
  Body,
} from '@nestjs/common';
import { UserValidationPipe } from './user.validation';
import { UserDTO } from './dto/user.dto';
import { UserService } from './user.service';
import { GeneralResponse } from 'src/common/dto/general-response.dto';

@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Post('create')
  async createUser(
    @Body(new UserValidationPipe()) userDTO: UserDTO,
  ): Promise<GeneralResponse<any>> {
    console.log(userDTO);
    const result = await this.userService.createUser(userDTO);
    return GeneralResponse.success(result);
  }

  @Get('')
  getUser() {
    return GeneralResponse.success(null);
  }

  @Get('userlist')
  getUserList() {
    return GeneralResponse.success([]);
  }

  @Put('update')
  udpateUserInfo() {
    return GeneralResponse.success(null);
  }

  @Delete('delete')
  deleteUser() {
    return GeneralResponse.success(null);
  }
}
