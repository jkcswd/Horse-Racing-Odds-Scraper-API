import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Access token required',
      message: 'Please provide a valid authorization token'
    });
    return;
  }

  const jwtSecret = process.env['JWT_SECRET'];
  if (!jwtSecret) {
    console.error('JWT_SECRET is not defined in environment variables');
    res.status(500).json({
      success: false,
      error: 'Server configuration error',
      message: 'Authentication service is not properly configured'
    });
    return;
  }

  try {
    // Just verify token is valid, don't need user data for this API
    jwt.verify(token, jwtSecret);
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