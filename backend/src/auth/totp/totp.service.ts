/**
 * TotpService
 * -----------
 * Pure Time-based One-Time Password (TOTP, RFC 6238) logic, isolated
 * from HTTP, persistence and the rest of the app. This is the only
 * security-sensitive brick of the 2FA feature, kept small so it can be
 * audited and unit-tested on its own. It never touches the database.
 */
import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';

@Injectable()
export class TotpService {
  /** Label shown by authenticator apps (Google Authenticator, etc.). */
  private readonly issuer = 'ft_transcendence';

  /**
   * Dedicated authenticator instance with a +/-1 time-step tolerance,
   * so a code is still accepted across a ~30s clock skew between the
   * server and the user's phone. `clone` avoids mutating otplib's
   * global default instance.
   */
  private readonly otp = authenticator.clone({ window: 1 });

  /** Generate a fresh base32 secret to bind to a user. */
  generateSecret(): string {
    return this.otp.generateSecret();
  }

  /**
   * Build the `otpauth://` URI that authenticator apps consume (usually
   * encoded as a QR code). `account` is what the user sees in their app,
   * typically their email or username.
   */
  buildOtpAuthUri(account: string, secret: string): string {
    return this.otp.keyuri(account, this.issuer, secret);
  }

  /** Verify a 6-digit code against the user's secret. */
  verify(token: string, secret: string): boolean {
    return this.otp.check(token, secret);
  }
}
