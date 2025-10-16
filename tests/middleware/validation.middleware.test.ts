import { Request, Response } from 'express';
import { validateScrapeRequest } from '../../src/middleware/validation.middleware';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let jsonSpy: jest.Mock;
  let statusSpy: jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    jsonSpy = jest.fn();
    statusSpy = jest.fn().mockReturnValue({ json: jsonSpy });
    
    mockRequest = {
      body: {}
    };
    
    mockResponse = {
      status: statusSpy,
      json: jsonSpy
    };
    
    mockNext = jest.fn();
  });

  describe('validateScrapeRequest', () => {
    it('should call next() for valid URL', () => {
      mockRequest.body = { eventUrl: 'https://www.ladbrokes.com/racing/event/123' };

      validateScrapeRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(statusSpy).not.toHaveBeenCalled();
      expect(jsonSpy).not.toHaveBeenCalled();
    });

    it('should call next() for valid HTTP URL', () => {
      mockRequest.body = { eventUrl: 'http://bet365.com/sport/horseracing' };

      validateScrapeRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(statusSpy).not.toHaveBeenCalled();
    });

    it('should return 400 error when eventUrl is missing', () => {
      mockRequest.body = {};

      validateScrapeRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: 'eventUrl is required',
        message: 'Please provide eventUrl in the request body'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 error when eventUrl is null', () => {
      mockRequest.body = { eventUrl: null };

      validateScrapeRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: 'eventUrl is required',
        message: 'Please provide eventUrl in the request body'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 error when eventUrl is undefined', () => {
      mockRequest.body = { eventUrl: undefined };

      validateScrapeRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: 'eventUrl is required',
        message: 'Please provide eventUrl in the request body'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 error when eventUrl is empty string', () => {
      mockRequest.body = { eventUrl: '' };

      validateScrapeRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: 'eventUrl is required',
        message: 'Please provide eventUrl in the request body'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 error when eventUrl is a number', () => {
      mockRequest.body = { eventUrl: 12345 };

      validateScrapeRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: 'eventUrl must be a string',
        message: 'eventUrl should be a valid URL string'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 error when eventUrl is an object', () => {
      mockRequest.body = { eventUrl: { url: 'https://example.com' } };

      validateScrapeRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: 'eventUrl must be a string',
        message: 'eventUrl should be a valid URL string'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 error when eventUrl is an array', () => {
      mockRequest.body = { eventUrl: ['https://example.com'] };

      validateScrapeRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: 'eventUrl must be a string',
        message: 'eventUrl should be a valid URL string'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 error when eventUrl is boolean', () => {
      mockRequest.body = { eventUrl: true };

      validateScrapeRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: 'eventUrl must be a string',
        message: 'eventUrl should be a valid URL string'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 error for invalid URL format', () => {
      mockRequest.body = { eventUrl: 'not-a-valid-url' };

      validateScrapeRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid URL format',
        message: 'Please provide a valid URL'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 error for URL without protocol', () => {
      mockRequest.body = { eventUrl: 'www.ladbrokes.com/racing' };

      validateScrapeRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid URL format',
        message: 'Please provide a valid URL'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });


    it('should accept URLs with different valid protocols', () => {
      const validUrls = [
        'https://www.ladbrokes.com/racing',
        'http://bet365.com/sport',
      ];

      validUrls.forEach((url) => {
        // Reset mocks before each iteration
        mockNext.mockClear();
        statusSpy.mockClear();
        jsonSpy.mockClear();
        
        mockRequest.body = { eventUrl: url };

        validateScrapeRequest(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(statusSpy).not.toHaveBeenCalled();
      });
    });

    it('should handle URLs with query parameters and fragments', () => {
      mockRequest.body = { 
        eventUrl: 'https://www.ladbrokes.com/racing/event/123?tab=odds&market=win#section1' 
      };

      validateScrapeRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(statusSpy).not.toHaveBeenCalled();
    });

    it('should handle URLs with ports', () => {
      mockRequest.body = { eventUrl: 'https://localhost:3000/api/odds' };

      validateScrapeRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(statusSpy).not.toHaveBeenCalled();
    });

    it('should return 400 error when unexpected fields are present in body', () => {
      mockRequest.body = { 
        eventUrl: 'https://www.ladbrokes.com/racing',
        extraField: 'not-allowed'
      };

      validateScrapeRequest(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Unexpected fields in request body',
        message: 'Only eventUrl is required in the request body'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});