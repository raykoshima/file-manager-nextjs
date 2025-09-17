import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbGet } from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): User | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      created_at: decoded.created_at
    };
  } catch (error) {
    return null;
  }
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const user = await dbGet('SELECT * FROM users WHERE username = ?', [username]);
  return user as User | null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
  return user as User | null;
}

export async function getUserById(id: number): Promise<User | null> {
  const user = await dbGet('SELECT * FROM users WHERE id = ?', [id]);
  return user as User | null;
}
