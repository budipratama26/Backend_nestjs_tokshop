import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, type Relation } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    name: string;
    @Column('decimal')
    price: number;
    @Column('int')
    quantity: number;
    @Column({ nullable: true })
    image: string;
    @Column('text')
    description: string;
    @CreateDateColumn()
    createdAt: Date;
    @UpdateDateColumn()
    updatedAt: Date;
    @DeleteDateColumn()
    deletedAt: Date;
    @ManyToOne(() => User, (user) => user.products)
    user: Relation<User>;
}
