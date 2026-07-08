import React from 'react';
import { Clock } from 'lucide-react';
import Layout from '../components/Layout';
import { COLORS } from '../../shared/colors';

const ComingSoon = ({ title }) => (
  <Layout>
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-6 p-12 rounded-3xl text-center max-w-md w-full"
        style={{ backgroundColor: COLORS.light, boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF' }}>
        <div className="p-5 rounded-full" style={{ backgroundColor: '#E8F5E9' }}>
          <Clock size={48} style={{ color: COLORS.primary }} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 mb-2">{title}</h1>
          <p className="text-gray-400 font-medium text-sm">This section is under development.<br />Coming Soon!</p>
        </div>
        <span className="px-5 py-2 rounded-full text-sm font-bold" style={{ backgroundColor: COLORS.primary, color: '#fff' }}>
          Coming Soon
        </span>
      </div>
    </div>
  </Layout>
);

export default ComingSoon;
