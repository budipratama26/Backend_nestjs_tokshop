import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";

@Entity()
export class BlacklistedToken {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column()
    jti: string;

    @Column()
    expiresAt: Date;
}