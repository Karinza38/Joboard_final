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

var CronJob = require('cron').CronJob;

const fetchGithub = require('./tasks/fetch.github')

// fetch github jobs
new CronJob('* * * * *', fetchGithub, null, true, 'America/Los_Angeles');
