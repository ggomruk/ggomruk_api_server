import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";


export class UserDTO {
    @IsNotEmpty()
    @IsString()
    @MinLength(8, {message: 'Username should be at least 8 characters long'})
    @Matches(/^(?=.*[a-z])(?=.*\d)[A-Za-z\d@$!%*?&_-]{8,}$/, {
        message: 'Username must be at least 8 characters with at least one lowercase letter and one number',
    })
    username: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8, {message: 'Password should be at least 8 characters long'})
    @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    })
    password: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;
    
}