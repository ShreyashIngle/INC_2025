import Topic from '../models/Topic.js';
import Question from '../models/Question.js';

// Topic Controllers
export const createTopic = async (req, res) => {
  try {
    const { name, description, order } = req.body;
    const topic = new Topic({ name, description, order });
    await topic.save();
    res.status(201).json(topic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTopics = async (req, res) => {
  try {
    const topics = await Topic.find().sort('order');
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Question Controllers
export const createQuestion = async (req, res) => {
  try {
    const { title, difficulty, topicId, link, platform, articleLink, practiceLink } = req.body;
    const question = new Question({
      title,
      difficulty,
      topicId,
      link,
      platform,
      articleLink,
      practiceLink
    });
    await question.save();
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBulkQuestions = async (req, res) => {
  try {
    const { topicId, questions } = req.body;
    
    const formattedQuestions = questions.map(q => ({
      title: q.title,
      difficulty: q.difficulty || 'Medium',
      topicId,
      link: q.link || q.practiceLink || '#',
      platform: q.platform || 'GeeksForGeeks',
      articleLink: q.articleLink || '#',
      practiceLink: q.practiceLink || q.link || '#'
    }));

    const createdQuestions = await Question.insertMany(formattedQuestions);
    res.status(201).json(createdQuestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getQuestionsByTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const questions = await Question.find({ topicId })
      .populate('topicId', 'name')
      .sort('difficulty');
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addNote = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    question.notes.push({ userId, content });
    await question.save();
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleStar = async (req, res) => {
  try {
    const { questionId } = req.params;
    const userId = req.userId;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const starredIndex = question.starredBy.indexOf(userId);
    if (starredIndex === -1) {
      question.starredBy.push(userId);
    } else {
      question.starredBy.splice(starredIndex, 1);
    }

    await question.save();
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsSolved = async (req, res) => {
  try {
    const { questionId } = req.params;
    const userId = req.userId;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const alreadySolved = question.solvedBy.some(solve => solve.userId.equals(userId));
    if (!alreadySolved) {
      question.solvedBy.push({ userId });
      await question.save();
    }

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProgress = async (req, res) => {
  try {
    const userId = req.userId;
    
    const topics = await Topic.find();
    const progress = [];

    for (const topic of topics) {
      const questions = await Question.find({ topicId: topic._id });
      const solved = await Question.countDocuments({
        topicId: topic._id,
        'solvedBy.userId': userId
      });

      progress.push({
        topic: topic.name,
        total: questions.length,
        solved,
        percentage: questions.length > 0 ? (solved / questions.length) * 100 : 0
      });
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};