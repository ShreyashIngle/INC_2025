import Session from '../models/Session.js';

// Create a new session
export const createSession = async (req, res) => {
  try {
    const { title, description, dateTime, meetLink } = req.body;
    const session = new Session({
      title,
      description,
      dateTime: new Date(dateTime),
      meetLink,
      createdBy: req.userId
    });
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: 'Error creating session', error: error.message });
  }
};

// Get all active sessions
export const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      createdBy: req.userId,
      isActive: true,
      dateTime: { $gt: new Date() }
    }).sort({ dateTime: 1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sessions', error: error.message });
  }
};

// Update session
export const updateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { title, description, dateTime, meetLink } = req.body;
    
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    session.title = title;
    session.description = description;
    session.dateTime = new Date(dateTime);
    session.meetLink = meetLink;

    await session.save();
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Error updating session', error: error.message });
  }
};

// Delete session
export const deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    await Session.findByIdAndDelete(sessionId);
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting session', error: error.message });
  }
};