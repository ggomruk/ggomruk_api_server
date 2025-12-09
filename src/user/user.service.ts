import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { UserDTO } from './dto/user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async findUser(username: string): Promise<User | null> {
    try {
      return await this.userModel.findOne({ username }).exec();
    } catch (error) {
      this.logger.error(`Error finding user: ${error.message}`);
      return null;
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    try {
      return await this.userModel.findOne({ email }).exec();
    } catch (error) {
      this.logger.error(`Error finding user by email: ${error.message}`);
      return null;
    }
  }

  async findUserById(userId: string): Promise<User | null> {
    try {
      return await this.userModel.findById(userId).exec();
    } catch (error) {
      this.logger.error(`Error finding user by id: ${error.message}`);
      return null;
    }
  }

  async createUser(userDto: UserDTO): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = await this.findUser(userDto.username);
      if (existingUser) {
        throw new ConflictException('Username already exists');
      }

      const existingEmail = await this.findUserByEmail(userDto.email);
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userDto.password, saltRounds);

      // Create new user
      const newUser = new this.userModel({
        username: userDto.username,
        email: userDto.email,
        password: hashedPassword,
      });

      return await newUser.save();
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`);
      throw error;
    }
  }

  async createOrUpdateGoogleUser(profile: any): Promise<User> {
    try {
      const email = profile.emails[0].value;
      let user = await this.findUserByEmail(email);

      if (!user) {
        // Create new user from Google profile
        const newUser = new this.userModel({
          username: email.split('@')[0] + '_' + Date.now(),
          email: email,
          password: '', // No password for OAuth users
          googleId: profile.id,
          displayName: profile.displayName,
          picture: profile.photos?.[0]?.value,
        });
        user = await newUser.save();
      } else {
        // Update existing user's Google info if needed
        if (!user.googleId) {
          await this.userModel.findByIdAndUpdate(
            user._id,
            {
              googleId: profile.id,
              displayName: profile.displayName,
              picture: profile.photos?.[0]?.value,
            },
            { new: true }
          );
        }
      }

      return user;
    } catch (error) {
      this.logger.error(`Error creating/updating Google user: ${error.message}`);
      throw error;
    }
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, user.password);
    } catch (error) {
      this.logger.error(`Error validating password: ${error.message}`);
      return false;
    }
  }
}
