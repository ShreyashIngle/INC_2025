import Company from '../models/Company.js';

// Create a new company
export const createCompany = async (req, res) => {
  try {
    const company = new Company({
      ...req.body,
      createdBy: req.userId
    });
    await company.save();
    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ message: 'Error creating company', error: error.message });
  }
};

// Get companies by month and year
export const getCompaniesByMonth = async (req, res) => {
  try {
    const { month, year } = req.query;
    const companies = await Company.find({
      createdBy: req.userId,
      month,
      year: parseInt(year)
    }).sort({ visitDate: 1 });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching companies', error: error.message });
  }
};

// Update company
export const updateCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const company = await Company.findByIdAndUpdate(
      companyId,
      req.body,
      { new: true }
    );
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: 'Error updating company', error: error.message });
  }
};

// Delete company
export const deleteCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    await Company.findByIdAndDelete(companyId);
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting company', error: error.message });
  }
};