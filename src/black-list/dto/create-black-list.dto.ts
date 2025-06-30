import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
/**
 * DTO for creating a single blacke listed user.
 * @example {
 *   "firstName": "John",
 *   "lastName": "Doe",
 *   "email": "john.doe@example.com",
 *   "phoneNumber": "+1234567890",
 * }
 */
export class CreateBlackListDto {
  @ApiPropertyOptional({
    example: 'user@example.com',
    description: 'The email of the user',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @Type(() => String)
  email: string;

  @ApiProperty({ example: 'John', description: 'The first name of the user' })
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  @Type(() => String)
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'The last name of the user' })
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  @Type(() => String)
  lastName: string;

  @ApiPropertyOptional({ example: '+213560620999' })
  @IsOptional()
  @IsString()
  @IsPhoneNumber()
  phoneNumber: string;
}
