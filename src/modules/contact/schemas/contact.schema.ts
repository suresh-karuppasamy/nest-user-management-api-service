import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Contact extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  phoneNumber: string;

  @Prop({ required: true })
  description: string;

  @Prop({ default: false })
  isAcknowledged: boolean;
}

export const ContactSchema = SchemaFactory.createForClass(Contact); 