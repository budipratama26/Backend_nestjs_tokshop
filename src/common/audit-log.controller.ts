import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.guard.js";
import { RolesGuard } from "../auth/roles.guard.js";
import { Roles } from "../auth/roles.decorator.js";
import { AuditLogService } from "./audit-log.service.js";
import { QueryAuditLogDto } from "./dto/query-audit-log.dto.js";

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
@Controller({ path: 'admin/audit-logs', version: '1' })

export class AuditLogController {
    constructor(
        private readonly auditLogService: AuditLogService
    ) { }

    @Get()
    @ApiOperation({ summary: 'Lihat semua audit log (Hanya Admin)' })
    findAll(@Query() query: QueryAuditLogDto) {
        return this.auditLogService.findAll(query);
    }
}