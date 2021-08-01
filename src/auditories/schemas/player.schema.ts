import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlayerExitDocument = PlayerExit & Document;

export interface IPlayerExit {
  address: string;
  timestamp: number;
  roundNumber: number;
  gameState: string;
  tickNumber: number;
  multiplier: number;
  exited: boolean;
}

@Schema()
export class PlayerExit {
  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  timestamp: number;

  @Prop({ required: true })
  roundNumber: number;

  @Prop({ required: true })
  tickNumber: number;

  @Prop({ required: true })
  multiplier: number;

  @Prop({ required: true })
  exited: boolean;

  @Prop({ required: true })
  gameState: string;
}

export const PlayerExitSchema = SchemaFactory.createForClass(PlayerExit);
