import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
const Strategy = require('passport-42').Strategy;

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy as any, '42') {
	constructor() {
		super({
			clientID: process.env.FORTYTWO_CLIENT_ID || 'dummy_client_id',
			clientSecret: process.env.FORTYTWO_CLIENT_SECRET || 'dummy_secret',
			callbackURL: 'https://localhost:8443/api/auth/42/callback',
			scope: ['public'],
			
		});

	}

	async validate(accessToken: string, refreshToken: string, profile: any, done:any){
		const { username, emails, _json } = profile;
		const user = {
			fortyTwoID: profile.id,
			username: username,
			email: emails[0].value,
			avatarUrl: _json.image.link,
		};
		return done(null, user);

	}

}
