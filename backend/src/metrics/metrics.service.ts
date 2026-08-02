/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   metrics.service.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: jbaumfal < jbaumfal@student.42.fr>         +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/07/21 19:12:03 by jbaumfal          #+#    #+#             */
/*   Updated: 2026/08/01 17:00:14 by jbaumfal         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Injectable } from '@nestjs/common';	
import * as promClient from 'prom-client';

@Injectable()
export class MetricsService {
	private readonly register = new promClient.Registry();
	
	readonly httpDuration = new promClient.Histogram({
		name: 'http_request_duration_seconds',
		help: 'HTTP request duration in seconds',
		labelNames: ['method', 'route', 'status_code'],
		buckets: [0.05, 0.1, 0.3, 1, 3],
		registers: [this.register],
	});

	constructor() {
		promClient.collectDefaultMetrics({ register: this.register });
	}

	get contentType(): string {
		return this.register.contentType;
	}

	metrics(): Promise<string> {
		return this.register.metrics();
	}
}