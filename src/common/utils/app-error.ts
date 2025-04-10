import { HTTPSTATUS, HttpStatusCode } from '../../config/http.config';
import { ErrorCode } from '../enums/error-code.enum';

export class AppError extends Error {
  public statusCode: HttpStatusCode;
  public errorCode?: ErrorCode;

  constructor(
    message: string,
    statusCode: HttpStatusCode = HTTPSTATUS.INTERNAL_SERVER_ERROR,
    errorCode?: ErrorCode,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;

    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error().stack;
    }
  }
}
