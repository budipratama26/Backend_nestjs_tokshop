import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  DeleteDateColumn,
  type Relation,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity.js';

export enum UserRole {
  ADMIN = 'admin',
  SELLER = 'seller',
  CUSTOMER = 'customer',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ type: 'varchar', default: UserRole.CUSTOMER })
  role: UserRole;

  @Column({ default: 0, select: false })
  failedLoginAttempts: number;

  @Column({ type: 'datetime', nullable: true, select: false })
  lockedUntil: Date | null;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Product, (product) => product.user)
  products: Relation<Product[]>;
}
