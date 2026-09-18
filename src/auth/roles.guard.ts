import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator.js';
import { AuditLogService } from '../common/audit-log.service.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector,
    private auditLogService: AuditLogService
  ) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();

    const { user } = request;

    if (!user) {
      throw new UnauthorizedException('Silahkan login terlebih dahulu');
    }

    if (!requiredRoles.includes(user.role)) {
      void this.auditLogService.log({
        action: 'AUTHORIZATION_FAILED', userId: user.sub || user.id || null,
        targetType: 'ROUTE',
        targetId: request.url,
        ipAddress: request.ip,
        details: {
          requiredRoles,
          userRole: user.role,
          method: request.method,
        },
      });
      throw new ForbiddenException('Akses ditolak!');
    }

    return true;
  }
}
