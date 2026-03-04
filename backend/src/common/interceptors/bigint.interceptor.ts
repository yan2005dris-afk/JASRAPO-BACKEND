import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map } from 'rxjs/operators';
@Injectable()
export class BigIntInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext,next: CallHandler){
        return next.handle().pipe(
            map((data) => 
                JSON.parse(
                    JSON.stringify(data, (_, value) =>
                        typeof value === 'bigint' ? value.toString() : value,
                    ),
                ),
            ),
        );
    }
}