const fetchGithub = require('../worker/tasks/fetch.github');
const redis = require('redis');
const { promisify } = require('util');

jest.mock('redis', () => {
  const mClient = {
    on: jest.fn(),
    set: jest.fn(),
  };
  return { createClient: jest.fn(() => mClient) };
});

describe('Worker Tasks', () => {
  let client;
  let setAsync;

  beforeAll(() => {
    client = redis.createClient();
    setAsync = promisify(client.set).bind(client);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('fetchGithub should fetch and save jobs to Redis', async () => {
    const mockJobs = [
      { title: 'Junior Developer' },
      { title: 'Senior Developer' },
    ];

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockJobs),
      })
    );

    await fetchGithub();

    expect(client.set).toHaveBeenCalledWith(
      'github',
      JSON.stringify([{ title: 'Junior Developer' }])
    );
  });

  test('fetchGithub should handle errors when fetching jobs', async () => {
    global.fetch = jest.fn(() => Promise.reject('API error'));

    await fetchGithub();

    expect(client.set).not.toHaveBeenCalled();
  });

  test('fetchGithub should handle errors when saving jobs to Redis', async () => {
    const mockJobs = [{ title: 'Junior Developer' }];

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockJobs),
      })
    );

    client.set.mockImplementation((key, value, callback) => {
      callback('Redis error');
    });

    await fetchGithub();

    expect(client.set).toHaveBeenCalled();
  });
});
