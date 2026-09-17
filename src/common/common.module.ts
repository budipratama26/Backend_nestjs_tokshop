import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity.js';
import { AuditLogService } from './audit-log.service.js';
import { AuditLogController } from './audit-log.controller.js';

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([AuditLog])],
    controllers: [AuditLogController],
    providers: [AuditLogService],
    exports: [AuditLogService],
})
export class CommonModule { }