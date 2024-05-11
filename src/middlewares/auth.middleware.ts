import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import JwtUtils from '@/utils/jwtUtils';
import HttpException from '@/utils/exceptions/http.exception';

declare global {
  namespace Express {
    interface Request {
      decodedToken?: any; 
    }
  }
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      throw new HttpException(httpStatus.UNAUTHORIZED, 'Not authorized');
    }
    const decoded = JwtUtils.verifyToken(token);
    if (!decoded) {
      throw new HttpException(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
    }
    req.decodedToken = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;
