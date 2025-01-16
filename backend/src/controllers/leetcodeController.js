import axios from 'axios';

const LEETCODE_API_BASE = 'https://leetcode-api.p.rapidapi.com';
const LEETCODE_API_KEY = process.env.RAPIDAPI_KEY;

const leetcodeApi = axios.create({
  baseURL: LEETCODE_API_BASE,
  headers: {
    'x-rapidapi-key': LEETCODE_API_KEY,
    'x-rapidapi-host': 'leetcode-api.p.rapidapi.com'
  }
});

export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const response = await leetcodeApi.get(`/user/${username}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch LeetCode profile' });
  }
};

export const getProblemsSolved = async (req, res) => {
  try {
    const { username } = req.params;
    const response = await leetcodeApi.get(`/user/${username}/solved`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch solved problems' });
  }
};

export const getSubmissions = async (req, res) => {
  try {
    const { username } = req.params;
    const response = await leetcodeApi.get(`/user/${username}/submissions?limit=13`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch submissions' });
  }
};

export const getActiveYear = async (req, res) => {
  try {
    const { username, year } = req.params;
    const response = await leetcodeApi.get(`/user/${username}/active-years?year=${year}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch active year data' });
  }
};

export const getContests = async (req, res) => {
  try {
    const { username } = req.params;
    const response = await leetcodeApi.get(`/user/${username}/contests`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch contest data' });
  }
};

export const getBadges = async (req, res) => {
  try {
    const { username } = req.params;
    const response = await leetcodeApi.get(`/user/${username}/badges`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch badges' });
  }
};