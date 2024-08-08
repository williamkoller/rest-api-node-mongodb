import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { BullModule } from '@nestjs/bull';
import { UserLog, UserLogSchema } from './entities/user-log.entity';
import { UserProcess } from './process/user.process';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserConsumer } from './consumer/user.consumer';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: UserLog.name,
        schema: UserLogSchema,
      },
    ]),
    BullModule.registerQueueAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      name: 'user',
      useFactory: async (config: ConfigService) => ({
        redis: {
          host: config.get<string>('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
        },
      }),
    }),
  ],
  controllers: [UserController],
  providers: [UserService, JwtService, UserProcess, UserConsumer],
  exports: [UserService],
})
export class UserModule {}
