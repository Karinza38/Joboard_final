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

var fetch = require('node-fetch')
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
const setAsync = promisify(client.set).bind(client);
const baseURL = process.env.GITHUB_JOBS_API_URL || 'https://jobs.github.com/positions.json';

async function fetchGithub() {
    let resultCount = 1, onPage = 0;
    const allJobs = [];
    //fetch all pages
    while (resultCount > 0) {
        try {
            const res = await fetch(`${baseURL}?page=${onPage}`);
            const jobs = await res.json();
            allJobs.push(...jobs);
            resultCount = jobs.length;
            logger.info(`Fetched ${resultCount} jobs from page ${onPage}`);
            onPage++;
        } catch (err) {
            logger.error('Error fetching jobs from GitHub Jobs API:', err);
            break;
        }
    }
    logger.info(`Fetched a total of ${allJobs.length} jobs`);

    //filter algo
    const jrJobs = allJobs.filter(job => {
        const jobTitle = job.title.toLowerCase();

        //algo logic
        if (
            jobTitle.includes('senior') ||
            jobTitle.includes('manager') ||
            jobTitle.includes('sr.') ||
            jobTitle.includes('architect') ||
            jobTitle.includes('lead') ||
            jobTitle.includes('principal')
        ) {
            return false;
        }

        return true;
    });

    logger.info(`Filtered down to ${jrJobs.length} junior jobs`);

    //set in redis
    try {
        const success = await setAsync('github', JSON.stringify(jrJobs));
        logger.info('Jobs successfully saved to Redis:', success);
    } catch (err) {
        logger.error('Error saving jobs to Redis:', err);
    }
}

module.exports = fetchGithub;
