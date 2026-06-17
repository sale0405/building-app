import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema } from '../validators/index.js';

describe('shared validators', () => {
  it('validates login schema', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: 'secret' });
    expect(result.success).toBe(true);
  });

  it('validates register schema', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: '12345678',
      name: 'Test User',
      role: 'RESIDENT',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid register email', () => {
    const result = registerSchema.safeParse({
      email: 'bad',
      password: '12345678',
      name: 'Test',
      role: 'RESIDENT',
    });
    expect(result.success).toBe(false);
  });
});
