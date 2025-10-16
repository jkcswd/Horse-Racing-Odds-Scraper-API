import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../../src/middleware/auth.middleware';

describe('Auth Middleware Integration Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let jsonSpy: jest.Mock;
  let statusSpy: jest.Mock;
  
  const TEST_SECRET = 'test-jwt-secret-key-for-auth-tests';
  const DIFFERENT_SECRET = 'different-secret-key';

  beforeEach(() => {
    // Set up real JWT secret for testing
    process.env['JWT_SECRET'] = TEST_SECRET;
    
    // Reset mocks
    jsonSpy = jest.fn();
    statusSpy = jest.fn().mockReturnValue({ json: jsonSpy });
    
    mockRequest = {
      headers: {}
    };
    
    mockResponse = {
      status: statusSpy,
      json: jsonSpy
    };
    
    mockNext = jest.fn();
  });

  afterEach(() => {
    delete process.env['JWT_SECRET'];
  });

  describe('Missing or Invalid Bearer Tokens (401 Errors)', () => {
    it('should return 401 when authorization header is missing', () => {
      mockRequest.headers = {};

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Access token required',
        message: 'Please provide a valid authorization token with Bearer scheme'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header is empty', () => {
      mockRequest.headers = { authorization: '' };

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when Bearer token is missing', () => {
      mockRequest.headers = { authorization: 'Bearer' };

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when Bearer token is empty', () => {
      mockRequest.headers = { authorization: 'Bearer ' };

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when using non-Bearer authentication scheme', () => {
      mockRequest.headers = { authorization: 'Basic dXNlcjpwYXNzd29yZA==' };

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(401); // Rejected at scheme validation stage
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Access token required',
        message: 'Please provide a valid authorization token with Bearer scheme'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Invalid JWT Tokens (403 Errors)', () => {
    it('should return 403 for malformed JWT token', () => {
      mockRequest.headers = { authorization: 'Bearer invalid.jwt.token' };

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(403);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid token',
        message: 'The provided authorization token is invalid or expired'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 for token signed with wrong secret', () => {
      // Create a token with a different secret
      const tokenWithWrongSecret = jwt.sign(
        { access: 'granted' },
        DIFFERENT_SECRET,
        { expiresIn: '1h' }
      );
      
      mockRequest.headers = { authorization: `Bearer ${tokenWithWrongSecret}` };

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(403);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid token',
        message: 'The provided authorization token is invalid or expired'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 for expired token', () => {
    //TODO double check this test works as expected as not sure about -1h
      // Create an expired token
      const expiredToken = jwt.sign(
        { access: 'granted' },
        TEST_SECRET,
        { expiresIn: '-1h' } // Expired 1 hour ago
      );
      
      mockRequest.headers = { authorization: `Bearer ${expiredToken}` };

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(403);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid token',
        message: 'The provided authorization token is invalid or expired'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 for token with invalid format', () => {
      mockRequest.headers = { authorization: 'Bearer not-a-jwt-token-at-all' };

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 for completely random string', () => {
      mockRequest.headers = { authorization: 'Bearer random-garbage-string-123' };

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Valid JWT Tokens (Success Cases)', () => {
    it('should call next() for valid token with correct secret', () => {
      // Create a valid token
      const validToken = jwt.sign(
        { access: 'granted' },
        TEST_SECRET,
        { expiresIn: '1h' }
      );
      
      mockRequest.headers = { authorization: `Bearer ${validToken}` };

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(statusSpy).not.toHaveBeenCalled();
      expect(jsonSpy).not.toHaveBeenCalled();
    });

    it('should work with long-lived tokens', () => {
      const validToken = jwt.sign(
        { access: 'granted' },
        TEST_SECRET,
        { expiresIn: '30d' }
      );
      
      mockRequest.headers = { authorization: `Bearer ${validToken}` };

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(statusSpy).not.toHaveBeenCalled();
    });
  });

  describe('Token Parsing Edge Cases', () => {
    it('should reject extra spaces after Bearer (RFC 6750 strict compliance)', () => {
      const validToken = jwt.sign({ access: 'granted' }, TEST_SECRET, { expiresIn: '1h' });
      mockRequest.headers = { authorization: `Bearer  ${validToken}` }; // Extra space
      
      // RFC 6750 requires exactly one space - extra spaces should be rejected
      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Access token required',
        message: 'Authorization header must be exactly "Bearer <token>" format'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject case-sensitive Bearer keyword (RFC 6750 compliant)', () => {
      const validToken = jwt.sign({ access: 'granted' }, TEST_SECRET, { expiresIn: '1h' });
      mockRequest.headers = { authorization: `bearer ${validToken}` }; // lowercase 'bearer'

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      // RFC 6750 requires exact "Bearer" case-sensitivity - lowercase should be rejected
      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Access token required',
        message: 'Please provide a valid authorization token with Bearer scheme'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject other case variations of Bearer', () => {
      const validToken = jwt.sign({ access: 'granted' }, TEST_SECRET, { expiresIn: '1h' });
      
      const caseVariations = ['BEARER', 'bearer', 'Beaarer', 'bear', 'BEAR'];
      
      caseVariations.forEach((variation) => {
        mockRequest.headers = { authorization: `${variation} ${validToken}` };
        
        authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);
        
        // All these should be rejected at the scheme validation stage
        expect(statusSpy).toHaveBeenCalledWith(401);
        expect(jsonSpy).toHaveBeenCalledWith({
          success: false,
          error: 'Access token required',
          message: 'Please provide a valid authorization token with Bearer scheme'
        });
        expect(mockNext).not.toHaveBeenCalled();
        
        // Reset mocks for next iteration
        statusSpy.mockClear();
        jsonSpy.mockClear();
        mockNext.mockClear();
      });
    });

    it('should return 401 for Bearer with multiple spaces and no token', () => {
      mockRequest.headers = { authorization: 'Bearer   ' };

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Access token required',
        message: 'Authorization header must be exactly "Bearer <token>" format'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject token with leading spaces', () => {
      const validToken = jwt.sign({ access: 'granted' }, TEST_SECRET, { expiresIn: '1h' });
      mockRequest.headers = { authorization: ` Bearer ${validToken}` };
      
      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Access token required',
        message: 'Please provide a valid authorization token with Bearer scheme'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject token with trailing spaces after token', () => {
      const validToken = jwt.sign({ access: 'granted' }, TEST_SECRET, { expiresIn: '1h' });
      mockRequest.headers = { authorization: `Bearer ${validToken} ` };
      
      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: 'Access token required',
        message: 'Authorization header must be exactly "Bearer <token>" format'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Real JWT Security Scenarios', () => {
    it('should reject none algorithm attack', () => {
      // Create a token with 'none' algorithm (security vulnerability)
      const noneToken = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJhY2Nlc3MiOiJncmFudGVkIn0.';
      
      mockRequest.headers = { authorization: `Bearer ${noneToken}` };

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});