/**
 * TotpCodeDto
 * -----------
 * Body for the enable / login-challenge requests: just the 6-digit code
 * from the authenticator app. The user is identified by their JWT, never
 * by the request body.
 */
import { IsString, Length, Matches } from 'class-validator';

export class TotpCodeDto {
  @IsString()
  @Length(6, 6, { message: 'The code must be exactly 6 digits.' })
  @Matches(/^\d{6}$/, { message: 'The code must contain only digits.' })
  token!: string;
}
