import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  role: number;
}

class JwtUtils {
  private static readonly secret: string = process.env.JWT_SECRET || '';

  static signToken(payload: JwtPayload, expiresIn: string): string {
    return jwt.sign(payload, JwtUtils.secret, { expiresIn });
  }

  static verifyToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.verify(token, JwtUtils.secret) as JwtPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }
}

export default JwtUtils;
