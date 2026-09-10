import { describe, it, expect, beforeEach, vi } from "vitest";
import { RolesGuard } from "./roles.guard.js";
import { Reflector } from "@nestjs/core";
import { ExecutionContext, UnauthorizedException, ForbiddenException } from "@nestjs/common";

describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflector: Reflector;

    beforeEach(() => {
        reflector = new Reflector();
        guard = new RolesGuard(reflector);
    });
    const createMockContext = (user?: any): ExecutionContext => {
        return {
            getHandler: vi.fn(),
            getClass: vi.fn(),
            switchToHttp: () => ({
                getRequest: () => ({ user }),
            }),
        } as unknown as ExecutionContext;
    };
    it('harus mengizinkan akses jika endpoint tidak membutuhkan role khusus', () => {
        vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
        const context = createMockContext();

        expect(guard.canActivate(context)).toBe(true);
    });
    it('harus melempar UnauthorizedException (401) jika user belum login', () => {
        vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
        const context = createMockContext(undefined);

        expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });
    it('harus melempar ForbiddenException (403) jika role user tidak sesuai', () => {
        vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
        const context = createMockContext({ sub: 1, role: 'customer' });

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
    it('harus mengizinkan akses (true) jika role user sesuai', () => {
        vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['seller']);
        const context = createMockContext({ sub: 1, role: 'seller'});

        expect(guard.canActivate(context)).toBe(true);
    });
});