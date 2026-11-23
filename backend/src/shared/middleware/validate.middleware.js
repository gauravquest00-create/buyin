import { ValidationError } from '../errors/AppError.js';

export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(
        new ValidationError('Request validation failed', result.error.flatten().fieldErrors)
      );
    }
    req[source] = result.data;
    return next();
  };
}
