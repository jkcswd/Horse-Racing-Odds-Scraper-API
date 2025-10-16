#!/usr/bin/env ts-node

import { program } from 'commander';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { scrapeOdds } from '../src/services/scraper';
import { closeBrowser } from '../src/services/scraper/utils/browser';
import logger from '../src/utils/logger';

program
  .name('horse-odds-scraper')
  .description('Scrape horse racing odds from bookmaker websites')
  .requiredOption('-u, --url <eventUrl>', 'URL of the horse racing event page')
  .action(async (options) => {
    try {
      const result = await scrapeOdds(options.url);
      
      if (result.success && result.data) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `scrape-results-${timestamp}.json`;
        const filepath = join(process.cwd(), filename);
        
        const outputData = {
          timestamp: new Date().toISOString(),
          data: result.data
        };
        
        writeFileSync(filepath, JSON.stringify(outputData, null, 2), 'utf8');
        logger.info('Scraping successful! Results written to file', { 
          filename, 
          horsesCount: result.data.horsesOddsData?.length || 0,
          url: options.url 
        });
      } else {
        logger.error('Scraping failed', { 
          error: result.error, 
          url: options.url 
        });
        process.exit(1);
      }
      
    } catch (error) {
      logger.error('Unexpected error during scraping', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        url: options.url,
        stack: error instanceof Error ? error.stack : undefined
      });
      process.exit(1);
    } finally {
      await closeBrowser();
    }
  });

program.parse();