import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDTO {
  @ApiProperty({ 
    description: 'Username', 
    example: 'john_doe' 
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ 
    description: 'Password', 
    example: 'SecurePassword123!' 
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
