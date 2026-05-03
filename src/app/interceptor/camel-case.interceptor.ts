import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { snakeToCamel } from '../utils/snake-to-camel.utils';

@Injectable()
export class CamelCaseInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse && event.body) {
          const camelCaseBody = snakeToCamel(event.body);
          return event.clone({ body: camelCaseBody });
        }
        return event;
      }),
    );
  }
}
