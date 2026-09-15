import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse: any = exception.getResponse();
      const message =
        typeof exceptionResponse === 'object' && exceptionResponse.message
          ? exceptionResponse.message
          : exception.message;
      const error =
        typeof exceptionResponse === 'object' && exceptionResponse.error
          ? exceptionResponse.error
          : exception.name;
      response.status(status).json({
        success: false,
        statusCode: status,
        message: message,
        error: error,
        path: request.url,
        timestamp: new Date().toISOString(),
      });
      return;
    }
    console.error('Unhandled exception:', exception);

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Terjadi kesalahan internal pada server',
      error: 'Internal Server Error',
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}