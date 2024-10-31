# Joboard

Joboard is a job board application that fetches job listings from the GitHub Jobs API and provides an API to access these job listings. It also includes a worker that periodically fetches new job listings and stores them in a Redis database.

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/ujaved931/Joboard_final.git
   ```
2. Navigate to the project directory:
   ```
   cd Joboard_final
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage

1. Start the API server:
   ```
   node api/index.js
   ```
2. Start the worker:
   ```
   node worker/index.js
   ```

## API Endpoints

- `GET /jobs`: Fetches the job listings stored in the Redis database.

## Worker Tasks

- The worker fetches job listings from the GitHub Jobs API every minute and stores them in the Redis database.
