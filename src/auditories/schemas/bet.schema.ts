import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BetDocument = Bet & Document;

export interface IBet {
  address: string;
  amount: string;
  timestamp: number;
  gameState: string;
  roundNumber: number;
  accepted: boolean;
  targetMultiplier?: number;
}

@Schema()
export class Bet {
  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  amount: string;

  @Prop({ require: false })
  targetMultiplier: number;

  @Prop({ required: true })
  timestamp: number;

  @Prop({ required: true })
  gameState: string;

  @Prop({ required: true })
  roundNumber: number;

  @Prop({ required: true })
  accepted: boolean;
}

export const BetSchema = SchemaFactory.createForClass(Bet);
