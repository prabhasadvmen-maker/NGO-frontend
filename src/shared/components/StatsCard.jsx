import React from 'react';
import { COLORS } from '../colors';

const StatsCard = ({ icon: Icon, label, value, color = COLORS.primary, trend, subtext }) => {
  return (
    <div
      className="rounded-2xl p-6 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 hover:shadow-xl cursor-pointer flex flex-col justify-between"
      style={{
        backgroundColor: COLORS.light,
        boxShadow: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF',
        minHeight: '160px',
      }}
    >
      {/* Top Row: Icon and optional Trend */}
      <div className="flex items-center justify-between mb-3">
        <div
          className="h-12 w-12 rounded-xl flex items-center justify-center"
          style={{
            backgroundColor: `${color}1A`, // ~10% opacity
            color: color,
          }}
        >
          <Icon size={24} />
        </div>
        {trend && (
          <div
            className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-0.5 ${
              trend.isUp 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-600'
            }`}
          >
            <span>{trend.isUp ? '▲' : '▼'}</span>
            <span>{trend.value}</span>
          </div>
        )}
      </div>

      {/* Content Section: Value, Label, and Subtext */}
      <div>
        <div className="text-3xl font-extrabold text-gray-800 mb-1">
          {value}
        </div>
        <div className="text-sm font-bold text-gray-700">
          {label}
        </div>
        {subtext && (
          <div className="text-xs text-gray-400 font-medium mt-1">
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
