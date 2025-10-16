import { parseUrl, getSupportedBookmaker } from '../../src/services/scraper/utils/url-parser';
import { scrapeLadbrokes, scrapeBet365 } from '../../src/services/scraper/sites';

describe('URL Parser Utils', () => {
  describe('parseUrl', () => {
    it('should extract hostname from valid HTTP URL', () => {
      const result = parseUrl('http://www.ladbrokes.com/racing');
      expect(result).toBe('www.ladbrokes.com');
    });

    it('should extract hostname from valid HTTPS URL', () => {
      const result = parseUrl('https://bet365.com/sport/horseracing');
      expect(result).toBe('bet365.com');
    });

    it('should return lowercase hostname', () => {
      const result = parseUrl('https://BET365.COM/sport');
      expect(result).toBe('bet365.com');
    });

    it('should handle URLs with paths and query parameters', () => {
      const result = parseUrl('https://www.ladbrokes.com/racing/event/123?tab=odds');
      expect(result).toBe('www.ladbrokes.com');
    });

    it('should handle URLs with ports', () => {
      const result = parseUrl('https://ladbrokes.com:443/racing');
      expect(result).toBe('ladbrokes.com');
    });

     // kept these in but validation middleware should catch most url validation issues
    it('should throw error for invalid URL format', () => {
      expect(() => parseUrl('not-a-valid-url')).toThrow('Invalid URL');
    });

    it('should throw error for empty string', () => {
      expect(() => parseUrl('')).toThrow('Invalid URL');
    });

    it('should throw error for null input', () => {
      expect(() => parseUrl(null as any)).toThrow('Invalid URL');
    });

    it('should throw error for undefined input', () => {
      expect(() => parseUrl(undefined as any)).toThrow('Invalid URL');
    });

    it('should handle URLs without protocol (should fail)', () => {
      expect(() => parseUrl('www.ladbrokes.com/racing')).toThrow('Invalid URL');
    });
  });

  describe('getSupportedBookmaker', () => {
    it('should return scrapeLadbrokes for ladbrokes.com', () => {
      const scraper = getSupportedBookmaker('https://ladbrokes.com/racing');
      expect(scraper).toBe(scrapeLadbrokes);
    });

    it('should return scrapeLadbrokes for www.ladbrokes.com', () => {
      const scraper = getSupportedBookmaker('https://www.ladbrokes.com/racing');
      expect(scraper).toBe(scrapeLadbrokes);
    });

    it('should return scrapeBet365 for bet365.com', () => {
      const scraper = getSupportedBookmaker('https://bet365.com/sport');
      expect(scraper).toBe(scrapeBet365);
    });

    it('should return scrapeBet365 for www.bet365.com', () => {
      const scraper = getSupportedBookmaker('https://www.bet365.com/sport');
      expect(scraper).toBe(scrapeBet365);
    });

    it('should handle case-insensitive domains', () => {
      const scraper = getSupportedBookmaker('https://LADBROKES.COM/racing');
      expect(scraper).toBe(scrapeLadbrokes);
    });

    it('should handle URLs with complex paths', () => {
      const scraper = getSupportedBookmaker('https://www.ladbrokes.com/racing/uk/today/12:30/ascot?tab=odds');
      expect(scraper).toBe(scrapeLadbrokes);
    });

    it('should throw error for unsupported bookmaker', () => {
      expect(() => {
        getSupportedBookmaker('https://unsupported-bookmaker.com/racing');
      }).toThrow('Unsupported bookmaker: unsupported-bookmaker.com');
    });

    it('should throw error for unsupported bookmaker', () => {
      expect(() => {
        getSupportedBookmaker('https://williamhill.com/racing');
      }).toThrow('Unsupported bookmaker: williamhill.com');
    });

    it('should throw error for invalid URL (propagated from parseUrl)', () => {
      expect(() => {
        getSupportedBookmaker('not-a-url');
      }).toThrow('Invalid URL');
    });
  });
});