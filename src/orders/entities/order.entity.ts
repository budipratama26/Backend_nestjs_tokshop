import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Product } from '../../products/entities/product.entity.js';

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    quantity: number;

    @Column()
    totalPrice: number;

    @ManyToOne(() => User)
    user: User;

    @ManyToOne(() => Product)
    product: Product;

    @CreateDateColumn()
    createdAt: Date;
}
