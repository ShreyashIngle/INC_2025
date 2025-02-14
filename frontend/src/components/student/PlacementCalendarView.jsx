import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Calendar,
  DollarSign,
  FileText,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function PlacementCalendarView() {
  const [companies, setCompanies] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#2196F3]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-white">Placement Calendar</h2>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          className="px-4 py-2 bg-[#091c2f] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2196F3]"
        >
          {months.map((month, index) => (
            <option key={month} value={index}>
              {month}
            </option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-4 py-2 bg-[#091c2f] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2196F3]"
        >
          {Array.from({ length: 5 }, (_, i) => selectedYear + i).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <motion.div
            key={company._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#05111b] rounded-xl p-6 shadow-lg"
          >
            <h3 className="text-xl font-bold text-white mb-4">{company.name}</h3>
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
                className="flex items-center gap-2 text-[#2196F3] hover:text-[#1976D2] transition-colors"
              >
                <FileText size={16} />
                View JD
              </a>
            </div>
          </motion.div>
        ))}

        {companies.length === 0 && (
          <div className="col-span-full text-center text-gray-400">
            No companies scheduled for {months[selectedMonth]} {selectedYear}
          </div>
        )}
      </div>
    </div>
  );
}

export default PlacementCalendarView;