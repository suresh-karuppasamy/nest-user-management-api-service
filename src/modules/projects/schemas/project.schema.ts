import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Client } from '../../clients/schemas/client.schema';
import { User } from '../../users/schemas/user.schema';

@Schema({ timestamps: true })
export class Project extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop()
  endDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'Client', required: true })
  client: Client;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  teamMembers: User[];

  @Prop({ type: String, enum: ['active', 'completed', 'on-hold'], default: 'active' })
  status: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const ProjectSchema = SchemaFactory.createForClass(Project); 