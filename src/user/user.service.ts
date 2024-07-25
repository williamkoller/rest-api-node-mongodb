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

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);
  private userConflictException = new ConflictException();
  private userNotFoundException = new NotFoundException();
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}
  async create(createUserDto: CreateUserDto) {
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

  async findAll() {
    return await this.userModel.find({}, { __v: false });
  }

  async findOne(id: string) {
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

  async update(id: string, updateUserDto: UpdateUserDto) {
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

  async remove(id: string) {
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

  async findByEmail(identifyUserByEmailDto: IdentifyUserByEmailDto) {
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
}
