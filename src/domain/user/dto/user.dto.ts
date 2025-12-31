import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';


export class UserDTO {
    @ApiProperty({ 
        description: 'Username (min 8 characters, at least one lowercase letter and one number)', 
        example: 'john_doe123',
        minLength: 8
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(8, {message: 'Username should be at least 8 characters long'})
    @Matches(/^(?=.*[a-z])(?=.*\d)[A-Za-z\d@$!%*?&_-]{8,}$/, {
        message: 'Username must be at least 8 characters with at least one lowercase letter and one number',
    })
    username: string;

    @ApiProperty({ 
        description: 'Password (min 8 characters, must contain uppercase, lowercase, number, and special character)', 
        example: 'SecurePass123!',
        minLength: 8
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(8, {message: 'Password should be at least 8 characters long'})
    @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    })
    password: string;

    @ApiProperty({ 
        description: 'User email address', 
        example: 'john.doe@example.com' 
    })
    @IsNotEmpty()
    @IsEmail()
    email: string;
    
}