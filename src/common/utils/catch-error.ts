import { HTTPSTATUS, HttpStatusCode } from '../../config/http.config';
import { ErrorCode } from '../enums/error-code.enum';
import { AppError } from './app-error';

export class NotFoundException extends AppError {
  constructor(message = 'Request not found', errorCode?: ErrorCode) {
    super(
      message,
      HTTPSTATUS.NOT_FOUND,
      errorCode || ErrorCode.RESOURCE_NOT_FOUND,
    );
  }
}

export class BadRequestException extends AppError {
  constructor(message = 'Bad Request', errorCode?: ErrorCode) {
    super(
      message,
      HTTPSTATUS.BAD_REQUEST,
      errorCode || ErrorCode.AUTH_USER_NOT_FOUND,
    );
  }
}

export class UnauthorizedException extends AppError {
  constructor(message = 'Unauthorized Access', errorCode?: ErrorCode) {
    super(
      message,
      HTTPSTATUS.UNAUTHORIZED,
      errorCode || ErrorCode.ACCESS_UNAUTHORIZED,
    );
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal Server Error', errorCode?: ErrorCode) {
    super(
      message,
      HTTPSTATUS.INTERNAL_SERVER_ERROR,
      errorCode || ErrorCode.INTERNAL_SERVER_ERROR,
    );
  }
}

export class HttpException extends AppError {
  constructor(
    message: 'Http Exception Error',
    statusCode: HttpStatusCode,
    errorCode?: ErrorCode,
  ) {
    super(message, statusCode, errorCode);
  }
}
