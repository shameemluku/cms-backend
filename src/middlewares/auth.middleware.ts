import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import JwtUtils from "@/utils/jwtUtils";
import HttpException from "@/utils/exceptions/http.exception";
import UserService from "@/resources/user/user.service";

declare global {
  namespace Express {
    interface Request {
      decodedToken?: any;
    }
  }
}

const userService = new UserService();

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      throw new HttpException(httpStatus.UNAUTHORIZED, "Not authorized");
    }
    const decoded = JwtUtils.verifyToken(token);
    if (!decoded) {
      throw new HttpException(
        httpStatus.UNAUTHORIZED,
        "Invalid or expired token"
      );
    }
    req.decodedToken = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

const authAdminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { decodedToken } = req;
    if (!decodedToken) {
      throw new HttpException(httpStatus.UNAUTHORIZED, "Not authorized");
    }
    const { userId } = decodedToken;
    let user = await userService.getUserById(userId);
    if (Number(user?.role) !== 1) {
      throw new HttpException(
        httpStatus.UNAUTHORIZED,
        "No enough role to access"
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};

export { authAdminMiddleware };
export default authMiddleware;
