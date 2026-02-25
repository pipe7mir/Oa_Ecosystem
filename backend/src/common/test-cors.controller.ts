import { Controller, Get, Headers, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('test-cors')
export class TestCorsController {
  @Get()
  test(@Req() req: Request, @Headers('origin') origin?: string) {
    return {
      success: true,
      message: 'CORS funcionando correctamente',
      origin: origin ?? null,
      method: req.method,
      timestamp: new Date().toISOString(),
      server: 'NestJS Backend',
    };
  }
}
