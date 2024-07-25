import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { compareSync } from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  private unauthorizedException = new UnauthorizedException(
    'Email or password is invalid',
  );
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  async login(createAuthDto: CreateAuthDto) {
    try {
      const user = await this.userService.findByEmail({
        email: createAuthDto.email,
      });

      const userIsValid = compareSync(createAuthDto.password, user.password);

      if (!userIsValid) {
        throw this.unauthorizedException;
      }

      const userSign = {
        _id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      const accessToken = await this.jwtService.signAsync(userSign, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      return {
        accessToken,
      };
    } catch (error) {
      this.logger.error(error.message);

      if (error instanceof UnauthorizedException) {
        throw this.unauthorizedException;
      }

      throw new BadRequestException(`AuthService [login]: ${error.message}`);
    }
  }
}
