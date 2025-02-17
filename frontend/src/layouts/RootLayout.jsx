import { Outlet } from 'react-router-dom';
import LanguageToggle from '../components/shared/LanguageToggle';
import Cursor from '../components/shared/Cursor';
import Footer from '../components/shared/Footer';
import Navbar from '../components/shared/Navbar';
import SessionMarquee from '../components/shared/SessionMarquee';

function RootLayout() {
  const userRole = localStorage.getItem('userRole');

  return (
    <div className="relative min-h-screen bg-black">
      <Cursor />
      <Navbar />
      {userRole === 'farmer' && <SessionMarquee />}
      <main>
        <Outlet />
      </main>
      <Footer />
      <LanguageToggle />
    </div>
  );
}

export default RootLayout;