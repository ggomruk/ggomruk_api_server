import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  private readonly users = [
    {
      userId: 1,
      username: 'admin',
      password: 'admin',
    },
    {
      userId: 2,
      username: 'test',
      password: 'test',
    },
  ];

  async findUser(username: string): Promise<any | undefined> {
    return this.users.find((user) => user.username === username);
  }
}
