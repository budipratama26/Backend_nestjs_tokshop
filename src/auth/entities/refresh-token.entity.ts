import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from '../../users/entities/user.entity.js';

@Entity()
export class RefreshToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    tokenHash: string;

    @Column({ default: false })
    isRevoked: boolean;

    @Column({ nullable: true })
    replacedByTokenId: string;

    @Column()
    expiresAt: Date;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user: User;

    @CreateDateColumn()
    createdAt: Date;
}





