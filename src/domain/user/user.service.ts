import {
  Injectable,
  Logger,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { UserAuth } from './user-auth.schema';
import { UserDTO } from './dto/user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserAuth.name) private userAuthModel: Model<UserAuth>,
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

      // Create core user profile
      const newUser = new this.userModel({
        username: userDto.username,
        email: userDto.email,
        displayName: userDto.username,
      });

      const savedUser = await newUser.save();

      try {
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userDto.password, saltRounds);

        // Create auth entry
        const newAuth = new this.userAuthModel({
          user: savedUser._id,
          provider: 'local',
          password: hashedPassword,
        });

        await newAuth.save();
      } catch (authError) {
        // Rollback user creation if auth fails
        await this.userModel.findByIdAndDelete(savedUser._id);
        throw authError;
      }

      return savedUser;
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
          displayName: profile.displayName,
          picture: profile.photos?.[0]?.value,
        });
        user = await newUser.save();
      } else {
        // Update existing user profile if needed
        let updated = false;
        if (!user.displayName && profile.displayName) {
          user.displayName = profile.displayName;
          updated = true;
        }
        if (!user.picture && profile.photos?.[0]?.value) {
          user.picture = profile.photos?.[0]?.value;
          updated = true;
        }
        if (updated) {
          await user.save();
        }
      }

      // Manage Auth
      const existingAuth = await this.userAuthModel
        .findOne({
          user: user._id,
          provider: 'google',
          providerUserId: profile.id,
        })
        .exec();

      if (!existingAuth) {
        const newAuth = new this.userAuthModel({
          user: user._id,
          provider: 'google',
          providerUserId: profile.id,
        });
        await newAuth.save();
      }

      return user;
    } catch (error) {
      this.logger.error(
        `Error creating/updating Google user: ${error.message}`,
      );
      throw error;
    }
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    try {
      const auth = await this.userAuthModel
        .findOne({
          user: user._id,
          provider: 'local',
        })
        .exec();

      if (!auth || !auth.password) {
        return false;
      }

      return await bcrypt.compare(password, auth.password);
    } catch (error) {
      this.logger.error(`Error validating password: ${error.message}`);
      return false;
    }
  }
}
