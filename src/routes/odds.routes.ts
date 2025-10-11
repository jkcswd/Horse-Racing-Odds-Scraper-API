import { Router } from 'express';
import { scrapeHorseOdds } from '../controllers/odds.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateScrapeRequest } from '../middleware/validation.middleware';

const router = Router();

// POST /odds - Scrape horse racing odds (requires authentication)
router.post('/odds', authenticateToken, validateScrapeRequest, scrapeHorseOdds);

export default router;