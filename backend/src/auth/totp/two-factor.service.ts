/**
 * TwoFactorService
 * ----------------
 * Orchestrates the 2FA flow on top of the pure TOTP logic, the QR
 * renderer and the persistence boundary. Holds no cryptography and no
 * HTTP concerns of its own; it is the place where "what 2FA does"
 * (enrol, confirm, check at login) is expressed.
 */
import {
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TotpService } from './totp.service';
import { QrCodeService } from './qrcode.service';
import { TWO_FACTOR_REPOSITORY } from './two-factor.repository';
import type {
  TwoFactorRepository,
  UserId,
} from './two-factor.repository';

export interface TotpSetup {
  /** Raw secret, for manual entry when a QR cannot be scanned. */
  secret: string;
  /** `otpauth://` URI consumed by authenticator apps. */
  otpauthUri: string;
  /** Base64 PNG data URL of the QR code. */
  qrCodeDataUrl: string;
}

@Injectable()
export class TwoFactorService {
  constructor(
    private readonly totp: TotpService,
    private readonly qrcode: QrCodeService,
    @Inject(TWO_FACTOR_REPOSITORY)
    private readonly repo: TwoFactorRepository,
  ) {}

  /**
   * Begin enrolment: generate a secret, store it as pending, and return
   * everything the user needs to register it in their app. 2FA is not
   * active until `activate` confirms the user can produce a valid code.
   */
  async setup(userId: UserId, account: string): Promise<TotpSetup> {
    const secret = this.totp.generateSecret();
    await this.repo.upsertSecret(userId, secret);

    const otpauthUri = this.totp.buildOtpAuthUri(account, secret);
    const qrCodeDataUrl = await this.qrcode.toDataUrl(otpauthUri);

    // INTEGRATION: returning the raw secret is convenient for manual
    // entry during dev; consider dropping it from the response in prod.
    return { secret, otpauthUri, qrCodeDataUrl };
  }

  /**
   * Confirm enrolment: the user proves they can generate a valid code,
   * after which 2FA becomes active. Throws if no secret is pending or
   * the code is wrong.
   */
  async activate(userId: UserId, token: string): Promise<void> {
    const secret = await this.repo.getSecret(userId);
    if (!secret) {
      throw new UnauthorizedException('No 2FA setup in progress.');
    }
    if (!this.totp.verify(token, secret)) {
      throw new UnauthorizedException('Invalid 2FA code.');
    }
    await this.repo.enable(userId);
  }

  /**
   * Check a code at login time. Returns false when 2FA is not enabled or
   * the code does not match.
   */
  async verifyLogin(userId: UserId, token: string): Promise<boolean> {
    if (!(await this.repo.isEnabled(userId))) return false;
    const secret = await this.repo.getSecret(userId);
    if (!secret) return false;
    return this.totp.verify(token, secret);
  }
}
