import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class GuardarPotencialDto {
  @ApiProperty({ example: 'Alto', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @ApiProperty({
    example: 1,
    type: 'integer',
    minimum: 0,
    maximum: 2147483647,
    description: 'Orden de presentación, de menor a mayor.',
  })
  @IsInt()
  @Min(0)
  @Max(2147483647)
  orden: number;
}
