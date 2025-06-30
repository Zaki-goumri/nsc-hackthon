import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';

@Entity()
export class BlackList {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique identifier of the blacklist entry',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: '+213654321987',
    description: 'The actual data value that is blacklisted',
  })
  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
    comment:
      'What kind of identifier this is (e.g., email, phone, name, address)',
  })
  phoneNumber?: string;

  @ApiProperty({
    example: 'a.goumri@gmail.com',
    description: 'email of the blacklisted',
  })
  @Column({
    type: 'varchar',
    length: 255,
    comment: 'The actual data (e.g., +213654321987)',
  })
  email?: string;
  @ApiProperty({ example: 'John', description: 'The first name of the user' })
  @Column({ type: 'varchar', length: 100 })
  firstName!: string;

  @ApiProperty({ example: 'Doe', description: 'The last name of the user' })
  @Column({ type: 'varchar', length: 100 })
  lastName!: string;

  @ApiProperty({
    example: 'Suspicious activity detected',
    description: 'The reason why this entry was blacklisted',
  })
  @Column({
    type: 'text',
    comment: 'Why it was blacklisted',
  })
  reason: string;

  @ApiProperty({
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'admin@company.com',
    },
    description: 'The user who added this entry to the blacklist',
    type: () => User,
  })
  @OneToOne(() => User)
  @JoinColumn({ name: 'sourceUserId' })
  source: User;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the user who added this entry to the blacklist',
  })
  @Column({
    type: 'uuid',
    comment: 'Which user added it',
  })
  sourceUserId: string;

  @ApiProperty({
    example: '2025-06-05T16:03:00Z',
    description: 'The timestamp when this entry was added to the blacklist',
  })
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    comment: 'When it was added',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-12-31T23:59:59Z',
    description:
      'The timestamp when this entry should be automatically removed (optional)',
    required: false,
  })
  @Column({
    type: 'timestamp',
    nullable: true,
    comment: 'When to automatically remove it',
  })
  expiresAt?: Date;

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
