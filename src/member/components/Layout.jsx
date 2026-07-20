import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useSidebar } from '../../shared/SidebarContext';
import SEOHead from '../../Website/components/SEOHead';

const Layout = ({ children }) => {
  const { isCollapsed } = useSidebar();
  return (
    <div className="flex h-screen bg-gray-100">
      <SEOHead noindex={true} />
      <Sidebar />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        <Navbar />
        <main className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
