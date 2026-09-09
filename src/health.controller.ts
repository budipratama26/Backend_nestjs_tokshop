import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { HealthCheckService, TypeOrmHealthIndicator, HealthCheck } from '@nestjs/terminus';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private db: TypeOrmHealthIndicator,
    ) { }

    @ApiOperation({ summary: 'Cek kesehatan server dan koneksi database' })
    @Get()
    @HealthCheck()
    check() {
        return this.health.check([() => this.db.pingCheck('database'),
        ]);
    }
}