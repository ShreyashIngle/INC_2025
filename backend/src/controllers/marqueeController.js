import Marquee from '../models/Marquee.js';

export const createMarquee = async (req, res) => {
  try {
    const { text } = req.body;
    
    // Deactivate all existing marquees
    await Marquee.updateMany({}, { isActive: false });
    
    const marquee = new Marquee({
      text,
      createdBy: req.userId
    });
    await marquee.save();
    res.status(201).json(marquee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getActiveMarquee = async (req, res) => {
  try {
    const marquee = await Marquee.findOne({ isActive: true })
      .sort('-createdAt');
    res.json(marquee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMarquee = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const marquee = await Marquee.findByIdAndUpdate(
      id,
      { text },
      { new: true }
    );
    res.json(marquee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMarquee = async (req, res) => {
  try {
    const { id } = req.params;
    await Marquee.findByIdAndDelete(id);
    res.json({ message: 'Marquee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};