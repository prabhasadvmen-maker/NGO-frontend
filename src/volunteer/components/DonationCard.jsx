import React from 'react';
import { MapPin, Phone, User, Clock, Utensils, CheckCircle, Truck, Eye, AlertCircle } from 'lucide-react';

export default function DonationCard({
  donation,
  onAccept,
  onCollect,
  onDistribute,
  onViewDetails,
  acceptingId,
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Verified':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs">Verified</span>;
      case 'Assigned':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-300">Assigned</span>;
      case 'Collected':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-300">Collected</span>;
      case 'Distributed':
      case 'Completed':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-800 text-white shadow-xs">Completed</span>;
      case 'Rejected':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-800 border border-red-300">Rejected</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">Pending</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Urgent':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-800 border border-red-200">Urgent</span>;
      case 'High':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-200">High</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-800 border border-blue-200">{priority || 'Medium'}</span>;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 md:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 font-sans">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-emerald-800">{donation.donationId}</h3>
            {getPriorityBadge(donation.priority)}
          </div>
          <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
            Submitted {new Date(donation.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div>{getStatusBadge(donation.status)}</div>
      </div>

      {/* Card Details */}
      <div className="space-y-3 text-xs text-slate-700">
        {/* Donor Info */}
        <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-150">
          <User size={16} className="text-emerald-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-extrabold text-slate-900 text-xs">{donation.donorName}</p>
            <p className="text-[11px] text-slate-500 font-semibold">{donation.organizationType} • {donation.donorPhone}</p>
          </div>
        </div>

        {/* Food Specs */}
        <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-150">
          <Utensils size={16} className="text-emerald-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-extrabold text-slate-900 text-xs">{donation.foodType} ({donation.quantity})</p>
            {donation.estimatedPeopleServed > 0 && (
              <p className="text-[11px] text-emerald-800 font-bold">Serves ~{donation.estimatedPeopleServed} people</p>
            )}
            <p className="text-[11px] text-slate-500 line-clamp-1">{donation.foodItemsDescription}</p>
          </div>
        </div>

        {/* Pickup Location */}
        <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-150">
          <MapPin size={16} className="text-emerald-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-extrabold text-slate-900 text-xs line-clamp-1">{donation.pickupAddress}</p>
            <p className="text-[11px] text-slate-500 font-semibold">{donation.city}, {donation.state} - {donation.pinCode}</p>
            <p className="text-[10px] font-black text-emerald-800 uppercase tracking-wider mt-1">
              Window: {donation.pickupTimeWindow}
            </p>
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
        {onViewDetails && (
          <button
            type="button"
            onClick={() => onViewDetails(donation)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Eye size={14} />
            <span>Details</span>
          </button>
        )}

        {/* Dynamic Workflow Actions */}
        {onAccept && (donation.status === 'Verified' || donation.status === 'Pending') && (
          <button
            type="button"
            disabled={acceptingId === donation._id}
            onClick={() => onAccept(donation._id)}
            className="flex-grow px-4 py-2.5 rounded-xl bg-[#1B5E20] hover:bg-emerald-800 text-white text-xs font-black transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <CheckCircle size={15} />
            <span>{acceptingId === donation._id ? 'Accepting...' : 'Accept Assignment'}</span>
          </button>
        )}

        {onCollect && donation.status === 'Assigned' && (
          <button
            type="button"
            onClick={() => onCollect(donation)}
            className="flex-grow px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <Truck size={15} />
            <span>Collect Now</span>
          </button>
        )}

        {onDistribute && donation.status === 'Collected' && (
          <button
            type="button"
            onClick={() => onDistribute(donation)}
            className="flex-grow px-4 py-2.5 rounded-xl bg-[#1B5E20] hover:bg-emerald-800 text-white text-xs font-black transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <CheckCircle size={15} />
            <span>Mark Distributed</span>
          </button>
        )}
      </div>
    </div>
  );
}
