import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index, type Relation } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;
    @Index()
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
    @Index()
    @CreateDateColumn()
    createdAt: Date;
    @UpdateDateColumn()
    updatedAt: Date;
    @DeleteDateColumn()
    deletedAt: Date;
    @ManyToOne(() => User, (user) => user.products)
    user: Relation<User>;
}
