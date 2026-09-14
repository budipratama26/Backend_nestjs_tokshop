import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Product } from '../../products/entities/product.entity.js';


export enum OrderStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    CANCELLED = 'CANCELLED',
}

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Index({ unique: true })
    @Column('varchar', { unique: true })
    orderNumber: string;

    @Column()
    quantity: number;

    @Column('int', { default: 0 })
    unitPrice: number;

    @Column('int')
    totalPrice: number;

    @Column({ type: 'varchar', default: OrderStatus.PAID })
    status: OrderStatus;

    @ManyToOne(() => User)
    user: User;

    @ManyToOne(() => Product)
    product: Product;

    @CreateDateColumn()
    createdAt: Date;
}
