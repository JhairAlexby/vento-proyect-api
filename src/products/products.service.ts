import { Injectable, NotFoundException, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = new this.productModel(createProductDto);
      await product.save();
      return product;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll(limit: number = 10, offset: number = 0) {
    try {
      const [total, products] = await Promise.all([
        this.productModel.countDocuments(),
        this.productModel.find()
          .skip(offset)
          .limit(limit)
          .sort({ createdAt: -1 })
      ]);

      return {
        total,
        products,
        offset,
        limit
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findOne(id: string) {
    try {
      const product = await this.productModel.findById(id);
      if (!product) {
        throw new NotFoundException(`Product with id ${id} not found`);
      }
      return product;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      const product = await this.productModel.findByIdAndUpdate(
        id,
        { $set: updateProductDto },
        { new: true }
      );

      if (!product) {
        throw new NotFoundException(`Product with id ${id} not found`);
      }

      return product;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async remove(id: string) {
    try {
      const product = await this.productModel.findByIdAndDelete(id);
      if (!product) {
        throw new NotFoundException(`Product with id ${id} not found`);
      }
      return { message: 'Product deleted successfully' };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  private handleDBErrors(error: any): never {
    this.logger.error(error);

    if (error.code === 11000) {
      throw new BadRequestException('Duplicate entry in database');
    }

    if (error.name === 'ValidationError') {
      throw new BadRequestException(error.message);
    }

    throw new InternalServerErrorException('Please check server logs');
  }
}