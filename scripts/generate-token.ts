import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';

export const generateTestToken = (): string => {
  const jwtSecret = process.env['JWT_SECRET'];
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET must be set');
  }
  
  // Simple payload - just need to verify they have a valid token
  const payload = {
    access: 'granted'
  };
  
  return jwt.sign(payload, jwtSecret, { 
    expiresIn: '24h',
    algorithm: 'HS256'
  });
};

const token = generateTestToken();

console.log('\n=== JWT Test Token ===');
console.log(`Token: ${token}`);
console.log('\nUsage:');
console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:3000/api/odds`);
console.log('\n');
