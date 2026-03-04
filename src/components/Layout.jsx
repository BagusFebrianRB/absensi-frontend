import { useState } from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar mobile */}
        <div className="md:hidden bg-white shadow px-4 py-3 flex items-center gap-3">
          <button onClick={() => setIsOpen(true)} className="text-gray-600 hover:text-gray-800 text-2xl">☰</button>
          <span className="font-semibold text-gray-700">Sistem Absensi</span>
        </div>
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;