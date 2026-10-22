import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
export class GuardarContactoDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nombre: string;
  @IsString()
  @MaxLength(100)
  cargo: string;
  @IsString()
  @MaxLength(30)
  telefono: string;
  @IsString()
  @MaxLength(30)
  celular: string;
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @ValidateIf((_obj, value) => value !== '')
  @IsEmail()
  @MaxLength(254)
  email: string;
  @IsBoolean()
  principal: boolean;
}
