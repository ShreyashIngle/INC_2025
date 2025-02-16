import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Plus,
  X,
  Calendar,
  DollarSign,
  FileText,
  Users,
  Edit2,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../dashboard/Sidebar';

function PlacementCalendar() {
  const [companies, setCompanies] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear] = useState(new Date().getFullYear());
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [newCompany, setNewCompany] = useState({
    name: '',
    description: '',
    visitDate: '',
    ctc: '',
    eligibility: '',
    jobDescriptionUrl: ''
  });

  useEffect(() => {
    fetchCompanies();
  }, [selectedMonth, selectedYear]);

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/companies?month=${months[selectedMonth]}&year=${selectedYear}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCompanies(response.data);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      toast.error('Failed to fetch companies');
    }
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const companyData = {
        ...newCompany,
        month: months[selectedMonth],
        year: selectedYear
      };

      if (editingCompany) {
        await axios.put(
          `http://localhost:5000/api/companies/${editingCompany._id}`,
          companyData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        toast.success('Company updated successfully');
      } else {
        await axios.post(
          'http://localhost:5000/api/companies',
          companyData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        toast.success('Company added successfully');
      }

      setIsAddingCompany(false);
      setEditingCompany(null);
      setNewCompany({
        name: '',
        description: '',
        visitDate: '',
        ctc: '',
        eligibility: '',
        jobDescriptionUrl: ''
      });
      fetchCompanies();
    } catch (error) {
      console.error('Failed to save company:', error);
      toast.error('Failed to save company');
    }
  };

  const handleDeleteCompany = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/companies/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCompanies();
      toast.success('Company deleted successfully');
    } catch (error) {
      console.error('Failed to delete company:', error);
      toast.error('Failed to delete company');
    }
  };

  const handleEditCompany = (company) => {
    setEditingCompany(company);
    setNewCompany({
      name: company.name,
      description: company.description,
      visitDate: new Date(company.visitDate).toISOString().split('T')[0],
      ctc: company.ctc,
      eligibility: company.eligibility,
      jobDescriptionUrl: company.jobDescriptionUrl
    });
    setIsAddingCompany(true);
  };

  const filteredCompanies = companies.filter(company => {
    const visitDate = new Date(company.visitDate);
    return visitDate.getMonth() === selectedMonth && visitDate.getFullYear() === selectedYear;
  });

  return (
    <div className="flex min-h-screen bg-[#091c2f]">
      <Sidebar />
      <div className="flex-1 ml-[250px] pt-20 p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white">Placement Calendar</h2>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-4 py-2 bg-[#091c2f] text-white rounded-lg"
            >
              {months.map((month, index) => (
                <option key={month} value={index}>
                  {month}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setIsAddingCompany(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2196F3] text-white rounded-lg hover:bg-[#1976D2] transition-colors"
          >
            <Plus size={20} />
            Add Company
          </button>
        </div>

        {isAddingCompany && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#05111b] rounded-xl p-6 w-full max-w-md mx-4"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">
                  {editingCompany ? 'Edit Company' : 'Add New Company'}
                </h3>
                <button
                  onClick={() => {
                    setIsAddingCompany(false);
                    setEditingCompany(null);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateCompany} className="space-y-4">
                <input
                  type="text"
                  placeholder="Company Name"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  className="w-full px-4 py-2 bg-[#091c2f] text-white rounded-lg"
                  required
                />
                <textarea
                  placeholder="Description"
                  value={newCompany.description}
                  onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
                  className="w-full px-4 py-2 bg-[#091c2f] text-white rounded-lg h-32"
                  required
                />
                <input
                  type="date"
                  value={newCompany.visitDate}
                  onChange={(e) => setNewCompany({ ...newCompany, visitDate: e.target.value })}
                  className="w-full px-4 py-2 bg-[#091c2f] text-white rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="CTC"
                  value={newCompany.ctc}
                  onChange={(e) => setNewCompany({ ...newCompany, ctc: e.target.value })}
                  className="w-full px-4 py-2 bg-[#091c2f] text-white rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Eligibility"
                  value={newCompany.eligibility}
                  onChange={(e) => setNewCompany({ ...newCompany, eligibility: e.target.value })}
                  className="w-full px-4 py-2 bg-[#091c2f] text-white rounded-lg"
                  required
                />
                <input
                  type="url"
                  placeholder="Job Description URL"
                  value={newCompany.jobDescriptionUrl}
                  onChange={(e) => setNewCompany({ ...newCompany, jobDescriptionUrl: e.target.value })}
                  className="w-full px-4 py-2 bg-[#091c2f] text-white rounded-lg"
                  required
                />
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCompany(false);
                      setEditingCompany(null);
                    }}
                    className="px-4 py-2 text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#2196F3] text-white rounded-lg hover:bg-[#1976D2]"
                  >
                    {editingCompany ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <motion.div
              key={company._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#05111b] rounded-xl p-6 shadow-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">{company.name}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditCompany(company)}
                    className="text-gray-400 hover:text-[#2196F3]"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteCompany(company._id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <p className="text-gray-400 mb-4">{company.description}</p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar size={16} />
                  <span>{new Date(company.visitDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <DollarSign size={16} />
                  <span>{company.ctc}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Users size={16} />
                  <span>{company.eligibility}</span>
                </div>
                <a
                  href={company.jobDescriptionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#2196F3] hover:text-[#1976D2]"
                >
                  <FileText size={16} />
                  View JD
                </a>
              </div>
            </motion.div>
          ))}

          {filteredCompanies.length === 0 && (
            <div className="col-span-full text-center text-gray-400">
              No companies scheduled for {months[selectedMonth]} {selectedYear}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default PlacementCalendar;