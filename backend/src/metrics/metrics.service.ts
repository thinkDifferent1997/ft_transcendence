/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   metrics.service.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: jbaumfal < jbaumfal@student.42.fr>         +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/07/21 19:12:03 by jbaumfal          #+#    #+#             */
/*   Updated: 2026/07/27 12:30:52 by jbaumfal         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Injectable } from '@nestjs/common';	
import * as promClient from 'prom-client';

@Injectable()
export class MetricsService {
	readonly register = new promClient.Registry();

	readonly httpDuration: promClient.Histogram<string>;
	readonly wsConnections: promClient.Gauge<string>;
	readonly gamesStarted: promClient.Counter<string>;

	constructor() {
		promClient.collectDefaultMetrics({ register: this.register });

		this.httpDuration = new promClient.Histogram({
			name: 'http_request_duration_seconds',
			help: 'HTTP request duration in seconds',
			labelNames: ['method', 'route', 'status_code'],
			buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 3, 5],
			registers: [this.register],
		});

		this.wsConnections = new promClient.Gauge({
			name: 'ws_active_connections',
			help: 'Currently connected Socket.IO clients',
			registers: [this.register],
		});

		this.gamesStarted = new promClient.Counter({
			name: 'quiz_games_started_total',
			help: 'Quiz games started since backend startup',
			registers: [this.register],
		});
	}

	get contentType(): string {
		return this.register.contentType;
	}

	metrics(): Promise<string> {
		return this.register.metrics();
	}
}