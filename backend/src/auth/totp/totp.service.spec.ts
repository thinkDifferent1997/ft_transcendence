/**
 * TotpService unit tests
 * ----------------------
 * Time is frozen with Jest fake timers so TOTP codes are deterministic.
 * Covers: a fresh code verifies, a wrong code is rejected, the skew
 * window accepts the previous 30s step, and a far-out code is rejected.
 */
import { TotpService } from './totp.service';

describe('TotpService', () => {
  let service: TotpService;
  // Fixed instant so generated codes are reproducible.
  const NOW = new Date('2026-06-26T12:00:00.000Z');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
    service = new TotpService();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('generates a non-empty secret', () => {
    expect(service.generateSecret().length).toBeGreaterThan(0);
  });

  it('builds an otpauth URI carrying the issuer and account', () => {
    const uri = service.buildOtpAuthUri('alice@example.com', service.generateSecret());
    expect(uri).toMatch(/^otpauth:\/\/totp\//);
    expect(uri).toContain('ft_transcendence');
    expect(uri).toContain('alice');
  });

  it('verifies a freshly generated code', () => {
    const secret = service.generateSecret();
    const code = service['otp'].generate(secret);
    expect(service.verify(code, secret)).toBe(true);
  });

  it('rejects an incorrect code', () => {
    const secret = service.generateSecret();
    expect(service.verify('000000', secret)).toBe(false);
  });

  it('accepts a code from the previous time step (clock skew window)', () => {
    const secret = service.generateSecret();
    const previousCode = service['otp'].generate(secret);
    // Advance one 30s step: the previous code must still be accepted.
    jest.setSystemTime(new Date(NOW.getTime() + 30_000));
    expect(service.verify(previousCode, secret)).toBe(true);
  });

  it('rejects a code that is several steps old', () => {
    const secret = service.generateSecret();
    const oldCode = service['otp'].generate(secret);
    jest.setSystemTime(new Date(NOW.getTime() + 5 * 60_000));
    expect(service.verify(oldCode, secret)).toBe(false);
  });
});
