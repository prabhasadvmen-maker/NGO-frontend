import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useSidebar } from '../../shared/SidebarContext';
import SEOHead from '../../Website/components/SEOHead';

const Layout = ({ children }) => {
  const { isCollapsed } = useSidebar();
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      <SEOHead noindex={true} />
      <Sidebar />
      <div className={`flex-1 flex flex-col min-w-0 h-full overflow-hidden transition-all duration-300 ${isCollapsed ? 'md:pl-20' : 'md:pl-64'}`}>
        <Navbar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
