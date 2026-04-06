import jwt from 'jsonwebtoken';
import { IUser } from '../types';

export const generateToken = (user: Partial<IUser> & { _id: string; email: string; role: string }): string => {
  return jwt.sign(
    { 
      userId: user._id,
      email: user.email,
      role: user.role 
    },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET!) as {
    userId: string;
    email: string;
    role: string;
  };
};
