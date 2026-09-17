import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuditLog } from "./entities/audit-log.entity.js";

@Injectable()
export class AuditLogService {
    constructor(
        @InjectRepository(AuditLog)
        private repo: Repository<AuditLog>,
    ) { }

    async log(params: {
        action: string;
        userId?: number | null;
        targetId?: string | null;
        targetType?: string | null;
        ipAddress?: string | null;
        details?: Record<string, any> | null;
    }) {
        await this.repo.save({
            action: params.action,
            userId: params.userId ?? null,
            targetId: params.targetId ?? null,
            targetType: params.targetType ?? null,
            ipAddress: params.ipAddress ?? null,
            details: params.details ? JSON.stringify(params.details) : null
        });
    }
    async findAll(query: {
        action?: string;
        userId?: number;
        page?: number;
        limit?: number;
    }) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const where: any = {};

        if (query.action) {
            where.action = query.action;
        }
        if (query.userId) {
            where.userId = query.userId;
        }
        const [items, total] = await this.repo.findAndCount({
            where,
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return {
            items,
            meta: {
                totalItems: total,
                currentPage: page,
                itemsPerPage: limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}