/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   metrics.interceptor.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: jbaumfal < jbaumfal@student.42.fr>         +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/07/21 19:11:59 by jbaumfal          #+#    #+#             */
/*   Updated: 2026/07/21 19:16:33 by jbaumfal         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (ctx.getType() !== 'http') return next.handle();

    const req = ctx.switchToHttp().getRequest();
    if (req.url === '/metrics') return next.handle();

    const stop = this.metrics.httpDuration.startTimer();

    return next.handle().pipe(
      finalize(() => {
        // route pattern, not the raw url, to keep cardinality low
        stop({
          method: req.method,
          route: req.route?.path ?? req.url,
          status_code: String(ctx.switchToHttp().getResponse().statusCode),
        });
      }),
    );
  }
}
