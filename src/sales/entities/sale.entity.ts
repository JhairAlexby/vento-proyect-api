import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../auth/entities/user.entity';
import { Order } from '../../orders/entities/order.entity';

@Schema({ timestamps: true })
export class Sale extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Order', required: true })
  order: Order;
  
  @Prop({ required: true })
  date: Date;

  @Prop({ required: true }) 
  total_amount: number;
  
  @Prop({ required: true })
  items_count: number;
}

export const SaleSchema = SchemaFactory.createForClass(Sale);