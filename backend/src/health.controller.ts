import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  healthCheck() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get()
  root() {
    return { message: 'OASIS API is running', version: '1.0.0' };
  }
}
