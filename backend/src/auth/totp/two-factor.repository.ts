/**
 * TwoFactorRepository
 * -------------------
 * Persistence boundary for 2FA state. The 2FA logic depends only on this
 * interface, never on a concrete database model. This is the seam that
 * keeps the feature buildable before the shared User model is finalised:
 * today it is backed by an in-memory map; once the User schema lands, a
 * Prisma implementation of the same interface is dropped in and the
 * binding in TwoFactorModule is swapped. No business logic changes.
 */

/**
 * Identifier of a user. Matches the `User.id` column, which is a UUID
 * string in the Prisma schema.
 */
export type UserId = string;

export interface TwoFactorRepository {
  /** Store (or replace) a user's secret. Enrolment is not yet confirmed. */
  upsertSecret(userId: UserId, secret: string): Promise<void>;
  /** Return the stored secret, or null if the user has none. */
  getSecret(userId: UserId): Promise<string | null>;
  /** Mark 2FA as confirmed/active for the user. */
  enable(userId: UserId): Promise<void>;
  /** Whether 2FA is currently active for the user. */
  isEnabled(userId: UserId): Promise<boolean>;
  /** Remove 2FA entirely for the user. */
  disable(userId: UserId): Promise<void>;
}

/** Injection token for the TwoFactorRepository interface. */
export const TWO_FACTOR_REPOSITORY = Symbol('TWO_FACTOR_REPOSITORY');

interface Record {
  secret: string;
  enabled: boolean;
}

/**
 * In-memory implementation used until the persistent (Prisma) one exists.
 * State is lost on restart — intended for local development and tests.
 */
export class InMemoryTwoFactorRepository implements TwoFactorRepository {
  private readonly store = new Map<UserId, Record>();

  async upsertSecret(userId: UserId, secret: string): Promise<void> {
    const existing = this.store.get(userId);
    this.store.set(userId, { secret, enabled: existing?.enabled ?? false });
  }

  async getSecret(userId: UserId): Promise<string | null> {
    return this.store.get(userId)?.secret ?? null;
  }

  async enable(userId: UserId): Promise<void> {
    const existing = this.store.get(userId);
    if (existing) existing.enabled = true;
  }

  async isEnabled(userId: UserId): Promise<boolean> {
    return this.store.get(userId)?.enabled ?? false;
  }

  async disable(userId: UserId): Promise<void> {
    this.store.delete(userId);
  }
}
