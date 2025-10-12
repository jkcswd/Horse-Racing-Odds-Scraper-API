import { Router } from 'express';
import { scrapeHorseOdds } from '../controllers/odds.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateScrapeRequest } from '../middleware/validation.middleware';

const router = Router();

router.post('/odds', authenticateToken, validateScrapeRequest, scrapeHorseOdds);

export default router;