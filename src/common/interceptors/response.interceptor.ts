import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { map } from 'rxjs/operators';
  import { Observable } from 'rxjs';
  
  @Injectable()
  export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
      const request = context.switchToHttp().getRequest();
      const response = context.switchToHttp().getResponse();
      
      return next.handle().pipe(
        map((data) => ({
          success: true,
          message: this.getSuccessMessage(request.method, data),
          data,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
          statusCode: response.statusCode,
        })),
      );
    }

    private getSuccessMessage(method: string, data: any): string {
      switch (method) {
        case 'GET':
          return data && Array.isArray(data) 
            ? `${data.length} records retrieved successfully`
            : 'Data retrieved successfully';
        case 'POST':
          return 'Resource created successfully';
        case 'PUT':
        case 'PATCH':
          return 'Resource updated successfully';
        case 'DELETE':
          return 'Resource deleted successfully';
        default:
          return 'Operation completed successfully';
      }
    }
  }
  
  export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
    path: string;
    method: string;
    statusCode: number;
  }
  