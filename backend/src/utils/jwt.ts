import jwt from 'jsonwebtoken';
import { IUser } from '../types';
import { config } from '../config';

export const generateToken = (user: Partial<IUser> & { _id: string; email: string; role: string }): string => {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role
  };
  const secret = config.jwtSecret;

  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, config.jwtSecret) as {
    userId: string;
    email: string;
    role: string;
  };
};
