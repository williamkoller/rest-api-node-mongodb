import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'user_logs', timestamps: true })
export class UserLog {
  @Prop({ type: Object, required: true })
  user: Record<any, any>;

  @Prop({ type: String, required: true })
  action: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const UserLogSchema = SchemaFactory.createForClass(UserLog);
