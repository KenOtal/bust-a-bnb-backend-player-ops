import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AllowListDocument = AllowList & Document;

export interface IAllowList {
  address: string;
}

@Schema()
export class AllowList {
  @Prop({ required: true })
  address: string;
}

export const AllowListSchema = SchemaFactory.createForClass(AllowList);
