import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm";

@Entity()
export class AuditLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column()
    action: string;

    @Index()
    @Column({ type: 'int', nullable: true })
    userId: number | null;

    @Column({ type: 'varchar', nullable: true })
    targetId: string | null;

    @Column({ type: 'varchar', nullable: true })
    targetType: string | null;

    @Column({ type: 'varchar', nullable: true })
    ipAddress: string | null;

    @Column({ type: 'text', nullable: true })
    details: string | null;

    @CreateDateColumn()
    @Index()
    createdAt: Date;
}

