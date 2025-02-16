import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import mapboxgl from 'mapbox-gl';
import { Activity, Users, Target, Trophy, Clock, MapPin, Phone, Mail } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

function MapView() {
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

    const marker = new mapboxgl.Marker({ color: '#95C11E' })
      .setLngLat([location.lng, location.lat])
      .addTo(map.current);
  }, []);

  const statsCards = [
    { icon: Target, label: 'Total Fields Analyzed', value: facilityStats.totalFieldsAnalyzed },
    { icon: Activity, label: 'Active Monitoring Areas', value: facilityStats.activeMonitoringAreas },
    { icon: Users, label: 'Farmers Engaged', value: facilityStats.totalFarmers },
    { icon: Trophy, label: 'Predicted Yield (Avg)', value: facilityStats.averageYield }
  ];
  

  return (
    <div className="p-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-8"
      >
        Facility Overview
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
  );
}

export default MapView;