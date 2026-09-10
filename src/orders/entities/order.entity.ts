import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Product } from '../../products/entities/product.entity.js';

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Index({ unique: true })
    @Column('varchar', { unique: true })
    orderNumber: string;

    @Column()
    quantity: number;

    @Column('decimal', { default: 0 })
    unitPrice: number;

    @Column()
    totalPrice: number;

    @Column({ default: 'PAID' })
    status: string;

    @ManyToOne(() => User)
    user: User;

    @ManyToOne(() => Product)
    product: Product;

    @CreateDateColumn()
    createdAt: Date;
}
