import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { Request, Response } from 'express';
  
  @Catch()
  export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
  
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'Internal server error';
  
      if (exception instanceof HttpException) {
        status = exception.getStatus();
        const res = exception.getResponse();
        message = typeof res === 'string' ? res : (res as any).message || message;
      } else if (exception instanceof Error) {
        message = exception.message;
      }
  
      response.status(status).json({
        success: false,
        message,
        error: this.getErrorName(status),
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        statusCode: status,
        details: exception instanceof HttpException ? exception.getResponse() : null,
      });
    }

    private getErrorName(status: number): string {
      switch (status) {
        case 400:
          return 'Bad Request';
        case 401:
          return 'Unauthorized';
        case 403:
          return 'Forbidden';
        case 404:
          return 'Not Found';
        case 409:
          return 'Conflict';
        case 422:
          return 'Unprocessable Entity';
        case 429:
          return 'Too Many Requests';
        case 500:
          return 'Internal Server Error';
        case 502:
          return 'Bad Gateway';
        case 503:
          return 'Service Unavailable';
        default:
          return 'Error';
      }
    }
  }
  