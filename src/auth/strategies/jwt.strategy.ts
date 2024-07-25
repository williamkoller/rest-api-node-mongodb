import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { JwtPayloadType } from '../@types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private logger = new Logger(JwtStrategy.name);
  private unauthorizedException = new UnauthorizedException();
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayloadType) {
    try {
      const user = await this.userService.findOne(payload._id);

      if (!user) {
        throw this.unauthorizedException;
      }

      return user;
    } catch (error) {
      this.logger.error(error.message);

      if (error instanceof UnauthorizedException) {
        throw this.unauthorizedException;
      }

      throw new BadRequestException(error.message);
    }
  }
}
