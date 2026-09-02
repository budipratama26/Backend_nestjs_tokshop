import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    name: string;
    @Column()
    price: number;
    @Column()
    quantity: number;
    @Column()
    description: string;
    @ManyToOne(() => User, (user) => user.products)
    user: User;
}
