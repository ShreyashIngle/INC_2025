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

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Placement Calendar</h2>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-4 py-2 bg-[#091c2f]"
          >
            {months.map((month, index) => (
              <option key={index} value={index}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
export default PlacementCalendar;