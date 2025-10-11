import { Request, Response, NextFunction } from 'express';

// Validation is very simple so no need for a library like zod
export const validateScrapeRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { eventUrl } = req.body;
  
  if (!eventUrl) {
    res.status(400).json({
      success: false,
      error: 'eventUrl is required',
      message: 'Please provide eventUrl in the request body'
    });
    return;
  }
  
  if (typeof eventUrl !== 'string') {
    res.status(400).json({
      success: false,
      error: 'eventUrl must be a string',
      message: 'eventUrl should be a valid URL string'
    });
    return;
  }
  
  try {
    new URL(eventUrl); // Will throw if not a valid URL
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid URL format',
      message: 'Please provide a valid URL'
    });
    return;
  }
  
  next();
};