const express = require('express')
const app = express()
const port = 3001

const dotenv = require('dotenv');
dotenv.config();

const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

var redis = require('redis'),
    client = redis.createClient({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD
    });

client.on('error', (err) => {
  logger.error('Redis connection error:', err);
});

const { promisify } = require('util');
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
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
