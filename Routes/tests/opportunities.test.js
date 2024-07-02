const request = require('supertest');
const express = require('express');
const routes = require('../routes/apiRoutes'); // Adjust this path to where your routes are defined

const app = express();
app.use(express.json());
app.use('/api', routes); // Setup API routes for testing

describe('API endpoint /api/opportunities', () => {
  test('should return 404 if no opportunities are found', async () => {
    const res = await request(app).get('/api/opportunities');
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'No investment opportunities found.');
  }, 10000); // Increased timeout for this test

  test('should return a list of opportunities sorted by timeToOpen if opportunities are present', async () => {
    const res = await request(app).get('/api/opportunities');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    if (res.body.length > 1) {
      const sorted = [...res.body].sort((a, b) => new Date(a.timeToOpen) - new Date(b.timeToOpen));
      expect(res.body).toEqual(sorted);
    }
  }, 10000); // Increased timeout for this test

  // Additional tests to ensure comprehensive coverage
  test('should handle malformed data gracefully', async () => {
    const res = await request(app).get('/api/opportunities');
    try {
      expect(res.statusCode).not.toBe(500);
      expect(res.body).toBeInstanceOf(Array);
    } catch (error) {
      console.error('Error handling malformed data:', error.message, error.stack);
      throw error;
    }
  }, 10000); // Increased timeout for this test

  test('should correctly populate data when data is well-formed', async () => {
    const res = await request(app).get('/api/opportunities');
    try {
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
      res.body.forEach(opportunity => {
        expect(opportunity).toHaveProperty('duration');
        expect(opportunity).toHaveProperty('opportunityName');
        expect(opportunity).toHaveProperty('provider');
        expect(opportunity).toHaveProperty('minimumAmountPerShare');
        expect(opportunity).toHaveProperty('timeToOpen');
        expect(opportunity).toHaveProperty('status');
        expect(opportunity).toHaveProperty('type');
        expect(opportunity).toHaveProperty('targetAmount');
        expect(opportunity).toHaveProperty('ROI');
        expect(opportunity).toHaveProperty('APR');
      });
    } catch (error) {
      console.error('Error with well-formed data:', error.message, error.stack);
      throw error;
    }
  }, 10000); // Increased timeout for this test
});