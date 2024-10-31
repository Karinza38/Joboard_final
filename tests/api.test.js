const request = require('supertest');
const express = require('express');
const redis = require('redis');
const { promisify } = require('util');
const winston = require('winston');

const app = express();
const port = 3001;

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});

client.on('error', (err) => {
  logger.error('Redis connection error:', err);
});

const getAsync = promisify(client.get).bind(client);

app.get('/jobs', async (req, res) => {
  try {
    const jobs = await getAsync('github');
    res.header("Access-Control-Allow-Origin", "http://localhost:3000")
    return res.send(jobs)
  } catch (err) {
    logger.error('Error fetching jobs:', err);
    res.status(500).send('Internal Server Error');
  }
});

describe('GET /jobs', () => {
  it('should fetch job listings from Redis', async () => {
    const mockJobs = JSON.stringify([{ title: 'Junior Developer' }]);
    client.set('github', mockJobs);

    const response = await request(app).get('/jobs');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(JSON.parse(mockJobs));
  });

  it('should return 500 if there is an error fetching jobs', async () => {
    client.get = jest.fn().mockImplementation((key, callback) => {
      callback(new Error('Redis error'), null);
    });

    const response = await request(app).get('/jobs');
    expect(response.status).toBe(500);
    expect(response.text).toBe('Internal Server Error');
  });
});
