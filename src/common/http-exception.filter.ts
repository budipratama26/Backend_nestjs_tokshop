import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();
        const exceptionResponse: any = exception.getResponse();
        const message = typeof exceptionResponse === 'object' && exceptionResponse.message ? exceptionResponse.message : exception.message;
        const error = typeof exceptionResponse === 'object' && exceptionResponse.error ? exceptionResponse.error : exception.name;
        response.status(status).json({
            success: false,
            statusCode: status,
            message: message,
            error: error,
            path: request.url,
            timestamp: new Date().toISOString(),
        });
    }
}
