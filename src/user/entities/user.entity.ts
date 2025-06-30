import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole, USER_ROLE_VALUES } from '../types/user-role.type';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @ApiProperty({ example: 1, description: 'The unique identifier of the user' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email address of the user',
  })
  @Column({ type: 'varchar', length: 100, unique: true })
  email!: string;

  @ApiProperty({
    example: 'hashedpassword',
    description: 'The hashed password of the user',
  })
  @Exclude()
  @Column({ type: 'varchar', length: 100 })
  password!: string;

  @ApiProperty({ example: 'John', description: 'The first name of the user' })
  @Column({ type: 'varchar', length: 100 })
  firstName!: string;

  @ApiProperty({ example: 'Doe', description: 'The last name of the user' })
  @Column({ type: 'varchar', length: 100 })
  lastName!: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'The phone number of the user',
  })
  @Column({ type: 'varchar', length: 20, unique: true })
  phoneNumber!: string;

  @ApiProperty({
    example: 'ADMIN',
    description: 'The role of the user (e.g., ADMIN,MANAGER',
  })
  @Column({ type: 'enum', enum: USER_ROLE_VALUES })
  role!: UserRole;

  @ApiProperty({
    example: '2025-06-05T16:03:00Z',
    description: 'The creation timestamp of the user',
  })
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty({
    example: '2025-06-05T16:03:00Z',
    description: 'The last update timestamp of the user',
  })
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
