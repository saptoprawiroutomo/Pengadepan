import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateCode(prefix: string, year: number, sequence: number): string {
  return `${prefix}-${year}-${sequence.toString().padStart(6, '0')}`;
}

export async function getNextSequence(prefix: string, year: number): Promise<number> {
  // This would typically query the database for the last sequence number
  // For now, return a simple timestamp-based sequence
  return Date.now() % 1000000;
}
