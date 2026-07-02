/**
 * PrismaTwoFactorRepository
 * -------------------------
 * Database-backed implementation of TwoFactorRepository, mapping the 2FA
 * state onto the existing User model (`twoFactorSecret`,
 * `isTwoFactorEnabled`). This is the only file that knows about Prisma;
 * the rest of the 2FA feature depends solely on the interface.
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { TwoFactorRepository, UserId } from './two-factor.repository';

@Injectable()
export class PrismaTwoFactorRepository implements TwoFactorRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertSecret(userId: UserId, secret: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });
  }

  async getSecret(userId: UserId): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true },
    });
    return user?.twoFactorSecret ?? null;
  }

  async enable(userId: UserId): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isTwoFactorEnabled: true },
    });
  }

  async isEnabled(userId: UserId): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isTwoFactorEnabled: true },
    });
    return user?.isTwoFactorEnabled ?? false;
  }

  async disable(userId: UserId): Promise<void> {
    // Clear the 2FA state without touching the rest of the user record.
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: null, isTwoFactorEnabled: false },
    });
  }
}
