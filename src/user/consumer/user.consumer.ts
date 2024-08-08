import {
  InjectQueue,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { User } from '../entities/user.entity';
import { Job, Queue } from 'bull';
import { UserService } from '../user.service';
import { Logger } from '@nestjs/common';

@Processor('user')
export class UserConsumer {
  private logger = new Logger(UserConsumer.name);

  constructor(
    @InjectQueue('user') private userQueue: Queue,
    private readonly userService: UserService,
  ) {}

  @Process('process_user')
  async processUser(jobUser: Job<User>) {
    this.logger.log(`processUser: ${JSON.stringify(jobUser.data)}`);
    await this.userService.create(jobUser.data);
  }

  @OnQueueCompleted()
  async onCompleted(job: Job<User>) {
    this.logger.log(`onCompleted: ${JSON.stringify(job.data)}`);
    const numberOfJobs = await this.userQueue.count();
    const activeJobs = await this.userQueue.getActiveCount();

    if (numberOfJobs === 0 && activeJobs === 0) {
      await this.userQueue.empty();
    }
  }

  @OnQueueFailed()
  public async onQueueFailed(job: Job<User[]>): Promise<void> {
    this.logger.log(
      `Error in processing queue: ${JSON.stringify(job.failedReason)}`,
    );
    await this.userService.createUserLogs(job.data, job.failedReason);
  }
}
