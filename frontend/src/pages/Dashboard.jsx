import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import mapboxgl from 'mapbox-gl';
import { Activity, Users, Target, Trophy, Clock, MapPin, Phone, Mail } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1Ijoic2lkY3VwZ29sZiIsImEiOiJjbHNxYzJtMmowMGRpMmpxcnp5Z2E0M3ZqIn0.your-token';

function Dashboard() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [location, setLocation] = useState({
    lng: -0.1,
    lat: 51.4,
    zoom: 12
  });

  const [facilityStats, setFacilityStats] = useState({
    totalBays: 46,
    activeBays: 38,
    totalPlayers: 124,
    averageScore: 72,
    openHours: '06:00 - 22:00',
    peakHours: '16:00 - 20:00'
  });

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [location.lng, location.lat],
      zoom: location.zoom
    });

    map.current.addControl(new mapboxgl.NavigationControl());

    // Add custom marker
    const marker = new mapboxgl.Marker({ color: '#95C11E' })
      .setLngLat([location.lng, location.lat])
      .addTo(map.current);
  }, []);

  const statsCards = [
    { icon: Target, label: 'Total Bays', value: facilityStats.totalBays },
    { icon: Activity, label: 'Active Bays', value: facilityStats.activeBays },
    { icon: Users, label: 'Total Players', value: facilityStats.totalPlayers },
    { icon: Trophy, label: 'Average Score', value: facilityStats.averageScore }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-8 text-center"
        >
          Facility Dashboard
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1 space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
              {statsCards.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, backgroundColor: '#1F2937' }}
                  className="bg-gray-800 p-6 rounded-xl transition-colors duration-300"
                >
                  <stat.icon className="w-8 h-8 text-brand-green mb-2" />
                  <h3 className="text-gray-400 text-sm">{stat.label}</h3>
                  <p className="text-3xl font-bold text-brand-green mt-2">
                    {stat.value}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gray-800 p-6 rounded-xl"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Clock className="w-6 h-6 text-brand-green mr-2" />
                Operating Hours
              </h2>
              <div className="space-y-2">
                <p className="text-gray-300">
                  Open: {facilityStats.openHours}
                </p>
                <p className="text-gray-300">
                  Peak Hours: {facilityStats.peakHours}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gray-800 p-6 rounded-xl"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <MapPin className="w-6 h-6 text-brand-green mr-2" />
                Location Details
              </h2>
              <div className="space-y-4">
                <p className="text-gray-300">
                  A20, SIDCUP BYPASS<br />
                  CHISLEHURST<br />
                  KENT<br />
                  BR7 6RP
                </p>
                <div className="flex items-center text-gray-300">
                  <Phone className="w-5 h-5 mr-2 text-brand-green" />
                  0208 309 0181
                </div>
                <div className="flex items-center text-gray-300">
                  <Mail className="w-5 h-5 mr-2 text-brand-green" />
                  info@sidcupgolf.com
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 h-[800px] rounded-xl overflow-hidden shadow-2xl"
          >
            <div ref={mapContainer} className="h-full w-full" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;