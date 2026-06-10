import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';

import { DomainError } from '../errors/domain.error';
import { LoggerService } from '../logging/logger.service';

import { mapDomainErrorToHttpStatus } from './domain-error-http.mapper';

interface ErrorResponseBody {
  readonly statusCode: number;
  readonly error: string;
  readonly message: string;
  readonly timestamp: string;
  readonly path: string;
}

interface HttpExceptionResponseObject {
  readonly message?: string | string[];
  readonly error?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, message, error } = this.resolveException(exception);

    if (statusCode >= 500) {
      this.logger.error(
        message,
        exception instanceof Error ? exception.stack : undefined,
        'HttpExceptionFilter',
      );
    }

    const body: ErrorResponseBody = {
      statusCode,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(statusCode).json(body);
  }

  private resolveException(exception: unknown): {
    statusCode: number;
    message: string;
    error: string;
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        return { statusCode: status, message: exceptionResponse, error: exception.name };
      }

      if (typeof exceptionResponse === 'object') {
        const responseObject = exceptionResponse as HttpExceptionResponseObject;
        const message = Array.isArray(responseObject.message)
          ? responseObject.message.join(', ')
          : (responseObject.message ?? exception.message);

        return {
          statusCode: status,
          message,
          error: responseObject.error ?? exception.name,
        };
      }
    }

    if (exception instanceof DomainError) {
      return {
        statusCode: mapDomainErrorToHttpStatus(exception),
        message: exception.message,
        error: exception.code,
      };
    }

    if (exception instanceof Error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: 'InternalServerError',
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'InternalServerError',
    };
  }
}
