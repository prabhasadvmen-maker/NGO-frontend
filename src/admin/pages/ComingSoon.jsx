import React from 'react';
import { Clock } from 'lucide-react';
import Layout from '../components/Layout';
import { COLORS } from '../../shared/colors';

const ComingSoon = ({ title }) => (
  <Layout>
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-5 p-12 rounded-3xl text-center max-w-sm w-full"
        style={{ backgroundColor: '#fff', boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}>
        <div className="p-4 rounded-full" style={{ backgroundColor: '#E8F5E9' }}>
          <Clock size={40} style={{ color: COLORS.primary }} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-gray-800 mb-1">{title}</h2>
          <p className="text-sm text-gray-400">This section is under development.</p>
        </div>
        <span className="px-5 py-2 rounded-full text-sm font-bold text-white" style={{ backgroundColor: COLORS.primary }}>
          Coming Soon
        </span>
      </div>
    </div>
  </Layout>
);

export default ComingSoon;
