import { Entity, PrimaryGeneratedColumn, Column, OneToMany, type Relation } from 'typeorm';
import { Product } from '../../products/entities/product.entity.js';

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

    @Column({ default: 'customer' })
    role: string;

    @OneToMany(() => Product, (product) => product.user)
    products: Relation<Product[]>;
}
