import { describe, it, expect } from 'vitest';
import bcrypt from 'bcryptjs';

describe('auth utilities', () => {
  it('hashes and verifies passwords', async () => {
    const hash = await bcrypt.hash('Test1234!', 12);
    const valid = await bcrypt.compare('Test1234!', hash);
    expect(valid).toBe(true);
  });
});
