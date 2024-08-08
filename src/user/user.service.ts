import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { genSaltSync, hashSync } from 'bcrypt';
import { IdentifyUserByEmailDto } from './dto/identify-user-by-email.dto';
import { UserLog } from './entities/user-log.entity';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);
  private userConflictException = new ConflictException();
  private userNotFoundException = new NotFoundException();
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(UserLog.name) private readonly userLogModel: Model<UserLog>,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const userExists = await this.userModel.findOne({
        email: { $eq: createUserDto.email },
      });

      if (userExists) {
        throw this.userConflictException;
      }

      const userWithHash = {
        ...createUserDto,
        password: hashSync(createUserDto.password, genSaltSync()),
      };

      const userCreate = new this.userModel(userWithHash);

      return await userCreate.save();
    } catch (error) {
      this.logger.error(error.message);

      if (error instanceof ConflictException) {
        throw this.userConflictException;
      }

      throw new BadRequestException(error.message);
    }
  }

  async findAll(): Promise<{ total: number; data: User[] }> {
    const users = await this.userModel.find({}, { __v: false });
    return {
      total: users.length,
      data: users,
    };
  }

  async findOne(id: string): Promise<User> {
    try {
      const userFound = await this.userModel.findOne({ _id: { $eq: id } });

      if (!userFound) {
        throw this.userNotFoundException;
      }

      return userFound;
    } catch (error) {
      this.logger.error(error.message);

      if (error instanceof NotFoundException) {
        throw this.userNotFoundException;
      }

      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const userFound = await this.userModel.findOne({ _id: { $eq: id } });

      if (!userFound) {
        throw this.userNotFoundException;
      }

      if (updateUserDto.password) {
        const userWithHash = {
          password: hashSync(updateUserDto.password, genSaltSync()),
        };

        return await this.userModel.findOneAndUpdate(
          {
            _id: { $eq: id },
          },
          {
            $set: { ...userWithHash },
          },
        );
      }

      return await this.userModel.findOneAndUpdate(
        {
          _id: { $eq: userFound?._id },
        },
        {
          $set: {
            ...updateUserDto,
          },
        },
        { new: true },
      );
    } catch (error) {
      this.logger.error(error.message);

      if (error instanceof NotFoundException) {
        throw this.userNotFoundException;
      }

      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const userFound = await this.userModel.findOne({ _id: { $eq: id } });

      if (!userFound) {
        throw this.userNotFoundException;
      }

      await this.userModel.deleteOne({ _id: { $eq: id } });
    } catch (error) {
      this.logger.error(error.message);

      if (error instanceof NotFoundException) {
        throw this.userNotFoundException;
      }

      throw new BadRequestException(error.message);
    }
  }

  async findByEmail(
    identifyUserByEmailDto: IdentifyUserByEmailDto,
  ): Promise<User> {
    try {
      const user = await this.userModel.findOne({
        email: { $eq: identifyUserByEmailDto?.email },
      });

      if (!user) {
        throw this.userNotFoundException;
      }

      return user;
    } catch (error) {
      this.logger.error(error.message);

      if (error instanceof NotFoundException) {
        throw this.userNotFoundException;
      }

      throw new BadRequestException(
        `UserService [findByEmail]: ${error.message}`,
      );
    }
  }

  async createUserLogs(
    createUsersDto: CreateUserDto[],
    action: string,
  ): Promise<void> {
    try {
      await this.userLogModel.insertMany({ user: createUsersDto, action });
    } catch (error) {
      this.logger.error(error.message);

      throw new BadRequestException(
        `UserService [createUserLogs]: ${error.message}`,
      );
    }
  }
}
