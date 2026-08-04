/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   metrics.controller.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: jbaumfal < jbaumfal@student.42.fr>         +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/07/21 19:12:02 by jbaumfal          #+#    #+#             */
/*   Updated: 2026/08/02 10:02:37 by jbaumfal         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
	constructor(private readonly metrics: MetricsService) {}

	@Get()
	async scrape(@Res() res: Response): Promise<void> {
		res.type(this.metrics.contentType);
		res.send(await this.metrics.metrics());
	}
}