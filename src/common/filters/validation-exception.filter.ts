import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { ValidationError } from 'class-validator';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    // Check if this is a validation error
    if (exceptionResponse.message === 'Validation failed') {
      const validationErrors = exceptionResponse.errors;
      const formattedErrors = this.formatValidationErrors(validationErrors);

      return response.status(status).json({
        statusCode: status,
        message: 'Validation failed',
        errors: formattedErrors,
      });
    }

    // For other types of BadRequestException
    return response.status(status).json({
      statusCode: status,
      message: exceptionResponse.message,
    });
  }

  private formatValidationErrors(errors: ValidationError[]): Record<string, string[]> {
    const formattedErrors: Record<string, string[]> = {};

    errors.forEach(error => {
      const constraints = error.constraints;
      if (constraints) {
        formattedErrors[error.property] = Object.values(constraints);
      }

      // Handle nested validation errors
      if (error.children && error.children.length > 0) {
        const nestedErrors = this.formatValidationErrors(error.children);
        Object.assign(formattedErrors, nestedErrors);
      }
    });

    return formattedErrors;
  }
} 