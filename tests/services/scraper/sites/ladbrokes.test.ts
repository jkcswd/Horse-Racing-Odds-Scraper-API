import { filterOutUnnamedFavourites } from '../../../../src/services/scraper/sites/ladbrokes';

type HorseData = { name: string; odds: string };

describe('Ladbrokes Data Processing', () => {
  describe('filterOutUnnamedFavourites', () => {
    it('should return all horses when all are valid', () => {
      const input: HorseData[] = [
        { name: 'Thunder Bolt', odds: '3/1' },
        { name: 'Lightning Strike', odds: '5/2' },
        { name: 'Storm Chaser', odds: '7/4' }
      ];
      
      const result = filterOutUnnamedFavourites(input);
      
      expect(result).toHaveLength(3);
      expect(result).toEqual(input);
    });

    it('should filter out unnamed favourite', () => {
      const input: HorseData[] = [
        { name: 'Thunder Bolt', odds: '3/1' },
        { name: 'Unnamed Favourite', odds: '2/1' },
        { name: 'Lightning Strike', odds: '5/2' }
      ];
      
      const result = filterOutUnnamedFavourites(input);
      
      expect(result).toHaveLength(2);
      expect(result.map(h => h.name)).toEqual(['Thunder Bolt', 'Lightning Strike']);
    });

    it('should filter out unnamed 2nd favourite', () => {
      const input: HorseData[] = [
        { name: 'Thunder Bolt', odds: '3/1' },
        { name: 'Unnamed 2nd Favourite', odds: '5/2' },
        { name: 'Lightning Strike', odds: '7/2' }
      ];
      
      const result = filterOutUnnamedFavourites(input);
      
      expect(result).toHaveLength(2);
      expect(result.map(h => h.name)).toEqual(['Thunder Bolt', 'Lightning Strike']);
    });

    it('should filter out unnamed 3rd favourite', () => {
      const input: HorseData[] = [
        { name: 'Thunder Bolt', odds: '3/1' },
        { name: 'Unnamed 3rd Favourite', odds: '4/1' },
        { name: 'Lightning Strike', odds: '5/1' }
      ];
      
      const result = filterOutUnnamedFavourites(input);
      
      expect(result).toHaveLength(2);
      expect(result.map(h => h.name)).toEqual(['Thunder Bolt', 'Lightning Strike']);
    });

    it('should filter out unnamed favorites with larger numbers', () => {
      const input: HorseData[] = [
        { name: 'Thunder Bolt', odds: '3/1' },
        { name: 'Unnamed 4th Favourite', odds: '6/1' },
        { name: 'Unnamed 5th Favourite', odds: '8/1' },
        { name: 'Unnamed 21st Favourite', odds: '50/1' },
        { name: 'Lightning Strike', odds: '5/1' }
      ];
      
      const result = filterOutUnnamedFavourites(input);
      
      expect(result).toHaveLength(2);
      expect(result.map(h => h.name)).toEqual(['Thunder Bolt', 'Lightning Strike']);
    });


    it('should handle partial matches correctly', () => {
      const input: HorseData[] = [
        { name: 'Favourite Thunder', odds: '7/4' }, // Should NOT be filtered (not "unnamed favourite")
        { name: 'Lightning Strike', odds: '9/4' }
      ];
      
      const result = filterOutUnnamedFavourites(input);
      
      expect(result).toHaveLength(2);
      expect(result.map(h => h.name)).toEqual([
        'Favourite Thunder',
        'Lightning Strike'
      ]);
    });

    it('should handle empty array', () => {
      const input: { name: string; odds: string }[] = [];
      
      const result = filterOutUnnamedFavourites(input);
      
      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it('should handle array with all filtered horses', () => {
      const input: HorseData[] = [ 
        { name: 'Unnamed Favourite', odds: 'SUSP' }
      ];
      
      const result = filterOutUnnamedFavourites(input);
      
      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it('should preserve original odds and name format', () => {
      const input: HorseData[] = [
        { name: 'Thunder Bolt', odds: '3/1 F' },
        { name: 'Lightning Strike', odds: '5-2' },
        { name: "O'Brien's Special", odds: '2.50' }
      ];
      
      const result = filterOutUnnamedFavourites(input);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ name: 'Thunder Bolt', odds: '3/1 F' });
      expect(result[1]).toEqual({ name: 'Lightning Strike', odds: '5-2' });
      expect(result[2]).toEqual({ name: "O'Brien's Special", odds: '2.50' });
    });

    it('should handle horses with numbers in names correctly', () => {
      const input: HorseData[] = [
        { name: 'Thunder 2', odds: '3/1' },
        { name: 'Lightning 3rd Class', odds: '5/2' },
        { name: 'Unnamed 2nd Favourite', odds: '4/1' }, // Should be filtered
        { name: 'Horse Number 1st', odds: '6/1' }
      ];
      
      const result = filterOutUnnamedFavourites(input);
      
      expect(result).toHaveLength(3);
      expect(result.map(h => h.name)).toEqual([
        'Thunder 2',
        'Lightning 3rd Class',
        'Horse Number 1st'
      ]);
    });

    it('should handle edge case ordinal patterns', () => {
      const input: HorseData[] = [
        { name: 'Thunder Bolt', odds: '3/1' },
        { name: 'Unnamed 11th Favourite', odds: '20/1' },
        { name: 'Unnamed 22nd Favourite', odds: '25/1' },
        { name: 'Unnamed 33rd Favourite', odds: '30/1' },
        { name: 'Unnamed 101st Favourite', odds: '100/1' },
        { name: 'Lightning Strike', odds: '5/1' }
      ];
      
      const result = filterOutUnnamedFavourites(input);
      
      expect(result).toHaveLength(2);
      expect(result.map(h => h.name)).toEqual(['Thunder Bolt', 'Lightning Strike']);
    });

    it('should maintain original array order for valid horses', () => {
      const input: HorseData[] = [
        { name: 'Zebra Last', odds: '10/1' },
        { name: 'Alpha First', odds: '2/1' },
        { name: 'Beta Second', odds: '3/1' }
      ];
      
      const result = filterOutUnnamedFavourites(input);
      
      expect(result).toHaveLength(3);
      expect(result.map(h => h.name)).toEqual(['Zebra Last', 'Alpha First', 'Beta Second']);
    });
  });
});