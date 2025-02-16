import { useState } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Droplets, Wind, Thermometer, Search, Sun, Moon } from 'lucide-react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const API_KEY = '450396f0a9c9411d958184954251901';
const BASE_URL = 'https://api.weatherapi.com/v1';

function WeatherForecast() {
  const [location, setLocation] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [currentResponse, forecastResponse] = await Promise.all([
        axios.get(`${BASE_URL}/current.json?key=${API_KEY}&q=${location}&aqi=yes`),
        axios.get(`${BASE_URL}/forecast.json?key=${API_KEY}&q=${location}&days=7&aqi=yes`)
      ]);

      setWeatherData({
        current: currentResponse.data,
        forecast: forecastResponse.data
      });
    } catch (err) {
      setError('Failed to fetch weather data. Please check the location and try again.');
      console.error('Weather API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (location.trim()) {
      fetchWeatherData();
    }
  };

  const formatChartData = (forecast) => {
    if (!forecast?.forecast?.forecastday) return [];
    
    return forecast.forecast.forecastday.map(day => ({
      date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
      'Max Temp (°C)': day.day.maxtemp_c,
      'Min Temp (°C)': day.day.mintemp_c,
      'Rainfall (mm)': day.day.totalprecip_mm
    }));
  };

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-8">Weather Forecast</h1>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location (e.g., London, New York, Tokyo)"
              className="w-full px-6 py-4 bg-gray-800 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 pr-16"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 p-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Search className="w-5 h-5 text-white" />
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl mb-8">
            {error}
          </div>
        )}

        {weatherData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Current Weather */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {weatherData.current.location.name}, {weatherData.current.location.country}
                  </h2>
                  <p className="text-lg opacity-75 mb-6">
                    {new Date(weatherData.current.location.localtime).toLocaleString()}
                  </p>
                  <div className="flex items-center gap-4">
                    <img
                      src={`https:${weatherData.current.current.condition.icon}`}
                      alt={weatherData.current.current.condition.text}
                      className="w-24 h-24"
                    />
                    <div>
                      <div className="text-5xl font-bold">
                        {weatherData.current.current.temp_c}°C
                      </div>
                      <div className="text-lg">
                        {weatherData.current.current.condition.text}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Wind className="w-5 h-5" />
                      <span>Wind</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {weatherData.current.current.wind_kph} km/h
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className="w-5 h-5" />
                      <span>Humidity</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {weatherData.current.current.humidity}%
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Thermometer className="w-5 h-5" />
                      <span>Feels Like</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {weatherData.current.current.feelslike_c}°C
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Cloud className="w-5 h-5" />
                      <span>Cloud Cover</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {weatherData.current.current.cloud}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Forecast Chart */}
            <div className="bg-gray-800 rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-6">7-Day Forecast</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formatChartData(weatherData.forecast)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: 'none',
                        borderRadius: '0.5rem',
                        color: '#fff'
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Max Temp (°C)"
                      stroke="#EF4444"
                      strokeWidth={2}
                      dot={{ fill: '#EF4444' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Min Temp (°C)"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Rainfall (mm)"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={{ fill: '#10B981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Daily Forecast Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {weatherData.forecast.forecast.forecastday.map((day) => (
                <div
                  key={day.date}
                  className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-lg font-semibold">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}
                      </div>
                      <div className="text-sm text-gray-400">
                        {new Date(day.date).toLocaleDateString()}
                      </div>
                    </div>
                    <img
                      src={`https:${day.day.condition.icon}`}
                      alt={day.day.condition.text}
                      className="w-12 h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Max Temp</span>
                      <span className="font-semibold">{day.day.maxtemp_c}°C</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Min Temp</span>
                      <span className="font-semibold">{day.day.mintemp_c}°C</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Rain</span>
                      <span className="font-semibold">{day.day.totalprecip_mm} mm</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default WeatherForecast;