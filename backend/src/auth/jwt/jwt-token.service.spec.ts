/**
 * JwtTokenService unit tests
 * --------------------------
 * Confirms the two token kinds carry the right `tfa` claim and subject,
 * and that issueLoginCookie gates on the user's 2FA state.
 */
import { JwtService } from '@nestjs/jwt';
import { JwtTokenService, ACCESS_TOKEN_COOKIE } from './jwt-token.service';

describe('JwtTokenService', () => {
  const jwt = new JwtService({ secret: 'test-secret' });
  const service = new JwtTokenService(jwt);
  const user = { id: 'uuid-123', username: 'alice' };

  it('signs a full token with an authenticated claim', () => {
    const payload = jwt.verify(service.signFull(user));
    expect(payload.sub).toBe('uuid-123');
    expect(payload.username).toBe('alice');
    expect(payload.tfa).toBe('authenticated');
  });

  it('signs a pending token with a pending claim', () => {
    const payload = jwt.verify(service.signPending(user));
    expect(payload.sub).toBe('uuid-123');
    expect(payload.tfa).toBe('pending');
  });

  it('issues a pending cookie when 2FA is enabled', () => {
    const res = { cookie: jest.fn() } as any;
    const result = service.issueLoginCookie(res, {
      ...user,
      isTwoFactorEnabled: true,
    });
    expect(result.twoFactorRequired).toBe(true);
    expect(res.cookie).toHaveBeenCalledWith(
      ACCESS_TOKEN_COOKIE,
      expect.any(String),
      expect.objectContaining({ httpOnly: true }),
    );
    const token = res.cookie.mock.calls[0][1];
    expect(jwt.verify(token).tfa).toBe('pending');
  });

  it('issues a full cookie when 2FA is disabled', () => {
    const res = { cookie: jest.fn() } as any;
    const result = service.issueLoginCookie(res, {
      ...user,
      isTwoFactorEnabled: false,
    });
    expect(result.twoFactorRequired).toBe(false);
    const token = res.cookie.mock.calls[0][1];
    expect(jwt.verify(token).tfa).toBe('authenticated');
  });
});
