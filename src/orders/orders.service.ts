import { Injectable, NotFoundException, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger('OrdersService');

  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>
  ) {}

  async create(createOrderDto: CreateOrderDto, user: User) {
    try {
      const order = new this.orderModel({
        user: user._id,
        order_date: new Date(),
        items: createOrderDto.items
      });

      await order.save();
      return order.populate('items.product');
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll(user: User, limit: number = 10, offset: number = 0) {
    try {
      const [total, orders] = await Promise.all([
        this.orderModel.countDocuments({ user: user._id }),
        this.orderModel.find({ user: user._id })
          .populate('items.product')
          .skip(offset)
          .limit(limit)
          .sort({ order_date: -1 })
      ]);

      return {
        total,
        orders,
        offset,
        limit
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findOne(id: string, user: User) {
    try {
      const order = await this.orderModel.findOne({
        _id: id,
        user: user._id
      }).populate('items.product');

      if (!order) {
        throw new NotFoundException(`Order with id ${id} not found`);
      }

      return order;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async remove(id: string, user: User) {
    try {
      const order = await this.orderModel.findOneAndDelete({
        _id: id,
        user: user._id
      });

      if (!order) {
        throw new NotFoundException(`Order with id ${id} not found`);
      }

      return { message: 'Order deleted successfully' };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  private handleDBErrors(error: any): never {
    this.logger.error(error);

    if (error.name === 'ValidationError') {
      throw new BadRequestException(error.message);
    }

    throw new InternalServerErrorException('Please check server logs');
  }
}