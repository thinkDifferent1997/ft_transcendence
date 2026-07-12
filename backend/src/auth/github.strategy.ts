/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   github.strategy.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: jbaumfal <jbaumfal@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/07/09 18:45:29 by jbaumfal          #+#    #+#             */
/*   Updated: 2026/07/09 18:57:45 by jbaumfal         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { PUBLIC_URL } from '../config/public-url';
const Strategy = require('passport-github2').Strategy;

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy as any, 'github') {
	constructor() {
		super({
			clientID: process.env.GITHUB_CLIENT_ID || 'dummy_client_id',
			clientSecret: process.env.GITHUB_CLIENT_SECRET || 'dummy_secret',
			callbackURL: `${PUBLIC_URL}/api/auth/github/callback`,
			scope: ['user:email'],
		});

	}

	async validate(accessToken: string, refreshToken: string, profile: any, done: any) {
		const { username, emails, photos } = profile;

		// GitHub liefert keine E-Mail, wenn der Nutzer sie privat gestellt
		// hat — Fallback auf die noreply-Adresse, damit das @unique-Feld
		// in Prisma nie mit null/undefined kollidiert.
		const email =
			emails?.[0]?.value || `${profile.id}@users.noreply.github.com`;

		const user = {
			githubID: profile.id,
			username: username,
			email: email,
			avatarUrl: photos?.[0]?.value || null,
		};
		return done(null, user);

	}

}