import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  
  // RFC 6750 requires exactly "Bearer " (with exactly one space)
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Access token required',
      message: 'Please provide a valid authorization token with Bearer scheme'
    });
    return;
  }
  
  // Strict RFC 6750 compliance: reject extra spaces after Bearer
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
    res.status(401).json({
      success: false,
      error: 'Access token required',
      message: 'Authorization header must be exactly "Bearer <token>" format'
    });
    return;
  }
  
  const token = parts[1]; // Extract token without any trim() to be strict

  try {
    // Just verify token is valid, don't need user data for this API
    // JWT_SECRET is validated at server startup, so we know it exists
    jwt.verify(token, process.env['JWT_SECRET']!);
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      error: 'Invalid token',
      message: 'The provided authorization token is invalid or expired'
    });
    return;
  }
};