import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsEmail } from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the user to be associated with this shop employee',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the shop where this employee will work',
  })
  @IsUUID()
  @IsNotEmpty()
  shopId: string;
}

export class CreateEmployeeByEmailDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email of the user to be associated with this shop employee',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
