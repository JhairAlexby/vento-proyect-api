import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSaleDto } from './dto/create-sale.dto';
import { Sale } from './entities/sale.entity';
import { User } from '../auth/entities/user.entity';
import { Order } from '../orders/entities/order.entity';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(Sale.name) private readonly saleModel: Model<Sale>,
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
  ) {}

  async create(createSaleDto: CreateSaleDto, user: User) {
    const order = await this.orderModel.findById(createSaleDto.order);

    if (!order || order.user.toString() !== user._id.toString()) {
      throw new NotFoundException('Order not found');
    }

    const sale = new this.saleModel({
      user: user._id,
      order: order._id,
      date: new Date(),
      total_amount: order.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      items_count: order.items.reduce((sum, item) => sum + item.quantity, 0),
    });

    return sale.save();
  }

  async findAll(user: User, fromDate?: string, toDate?: string) {
    const filter: any = { user: user._id };

    if (fromDate && toDate) {
      filter.date = { $gte: new Date(fromDate), $lte: new Date(toDate) };  
    }

    return this.saleModel.find(filter).populate('order');
  }

  async findOne(id: string, user: User) {
    const sale = await this.saleModel.findOne({ _id: id, user: user._id }).populate('order');

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    return sale;
  }
}