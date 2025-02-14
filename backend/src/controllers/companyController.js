import Company from '../models/Company.js';

export const createCompany = async (req, res) => {
  try {
    const {
      name,
      description,
      month,
      year,
      visitDate,
      ctc,
      eligibility,
      jobDescriptionUrl
    } = req.body;

    const company = new Company({
      name,
      description,
      month,
      year,
      visitDate,
      ctc,
      eligibility,
      jobDescriptionUrl,
      createdBy: req.userId
    });

    await company.save();
    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCompanies = async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = {};
    
    if (month) query.month = month;
    if (year) query.year = parseInt(year);
    
    const companies = await Company.find(query)
      .sort('visitDate');
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const company = await Company.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    await Company.findByIdAndDelete(id);
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};