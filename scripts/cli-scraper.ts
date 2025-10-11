#!/usr/bin/env ts-node

import { program } from 'commander';
import { scrapeOdds } from '../src/services/scraper';
import { closeBrowser } from '../src/services/scraper/utils/browser';

// Using commander for simple CLI tool creation.
program
  .name('horse-odds-scraper')
  .description('Scrape horse racing odds from bookmaker websites')
  .requiredOption('-u, --url <eventUrl>', 'URL of the horse racing event page')
  .action(async (options) => {
    try {
      const result = await scrapeOdds(options.url);
      
      if (result.success && result.data) {
        console.log(JSON.stringify(result.data, null, 2));
      } else {
        console.error(JSON.stringify({ error: result.error }, null, 2));
        process.exit(1);
      }
      
    } catch (error) {
      console.error(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }, null, 2));
      process.exit(1);
    } finally {
      await closeBrowser();
    }
  });

program.parse();