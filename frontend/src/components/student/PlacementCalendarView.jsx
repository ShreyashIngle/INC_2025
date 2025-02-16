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
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedMonth !== null) {
      fetchCompanies();
    }
  }, [selectedMonth, selectedYear]);

  const fetchCompanies = async () => {
    setLoading(true);
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
    <div className="p-6 mt-16"> {/* Added mt-16 to push content below the navbar */}
      {selectedMonth === null ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {months.map((month, index) => (
            <motion.div
              key={month}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#05111b] rounded-xl p-6 shadow-lg cursor-pointer"
              onClick={() => setSelectedMonth(index)}
            >
              <h3 className="text-xl font-bold text-white mb-4">{month}</h3>
            </motion.div>
          ))}
        </div>
      ) : (
        <div>
          <button
            onClick={() => setSelectedMonth(null)}
            className="mb-4 px-4 py-2 bg-[#091c2f] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2196F3]"
          >
            Back to Months
          </button>
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
      )}
    </div>
  );
}

export default PlacementCalendarView;