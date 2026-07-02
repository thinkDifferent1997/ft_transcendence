/**
 * QrCodeService
 * -------------
 * Turns an `otpauth://` URI into a base64 PNG data URL. Kept separate
 * from the TOTP logic so the cryptographic part stays free of rendering
 * concerns. The frontend can use the returned string directly as an
 * `<img src="...">` to display the QR code during 2FA enrolment.
 */
import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QrCodeService {
  async toDataUrl(otpauthUri: string): Promise<string> {
    return QRCode.toDataURL(otpauthUri);
  }
}
