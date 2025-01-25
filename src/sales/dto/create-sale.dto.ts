import { IsMongoId, IsNumber, Min } from 'class-validator';

export class CreateSaleDto {
  @IsMongoId()
  readonly order: string;
}