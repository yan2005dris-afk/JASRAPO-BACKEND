import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class BigIntInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler) {
        return next.handle().pipe(
            map((data) => {
                // Algunos handlers escriben la respuesta manualmente con @Res() y retornan undefined.
                // Evitamos JSON.parse(undefined), que dispara SyntaxError.
                if (data === undefined || data === null) {
                    return data;
                }

                const serialized = JSON.stringify(data, (_, value) =>
                    typeof value === 'bigint' ? value.toString() : value,
                );

                return serialized === undefined ? data : JSON.parse(serialized);
            }),
        );
    }
}