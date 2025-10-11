import { Request, Response } from 'express';
import {  ScrapeOddsRequest, ScrapeOddsResponse } from '../types/api.types';
import { scrapeOdds } from '../services/scraper';

export const scrapeHorseOdds = async (req: Request, res: Response<ScrapeOddsResponse>): Promise<void> => {
  try {
    const { eventUrl }: ScrapeOddsRequest = req.body;
    
    if (!eventUrl) {
      res.status(400).json({
        success: false,
        error: 'eventUrl is required',
        message: 'Please provide a valid eventUrl in the request body'
      });
      return;
    }
    
    const result = await scrapeOdds(eventUrl);
    
    if (result.success && result.data) {
      res.status(200).json({
        success: true,
        data: result.data,
        message: 'Odds scraped successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Failed to scrape odds',
        message: 'Unable to extract odds from the provided URL'
      });
    }
    
  } catch (error) {
    console.error('Error in scrapeHorseOdds controller:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred while processing your request'
    });
  }
};