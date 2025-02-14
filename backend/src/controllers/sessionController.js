import Session from '../models/Session.js';

export const createSession = async (req, res) => {
  try {
    const { title, description, meetLink, dateTime } = req.body;
    const session = new Session({
      title,
      description,
      meetLink,
      dateTime,
      createdBy: req.userId
    });
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find()
      .sort('dateTime');
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    await Session.findByIdAndDelete(id);
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};