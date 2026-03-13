import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export interface UserPayload {
  id: number;
  email: string;
}
