import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class UserProcess {
  constructor(@InjectQueue('user') private userQueue: Queue) {}

  async process(createUsersDto: CreateUserDto[]): Promise<void> {
    await Promise.all(
      createUsersDto.map((createUserDto) => {
        this.userQueue.add('process_user', createUserDto);
      }),
    );
  }
}
