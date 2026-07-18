import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Image as ImageIcon } from 'lucide-react';
import usePublicAPI from '../hooks/usePublicAPI';
import useScrollAnimation from '../hooks/useScrollAnimation';

export const GallerySection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { data: photos, loading } = usePublicAPI('/api/public/cms/gallery?limit=8');

  // Fallbacks if no data
  const defaultPhotos = [
    { _id: 'ph1', imageUrlResolved: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600', caption: 'Food distribution camp in Delhi' },
    { _id: 'ph2', imageUrlResolved: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=600', caption: 'Free health screening checkup Lucknow' },
    { _id: 'ph3', imageUrlResolved: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=600', caption: 'Women tailoring certificate training class' },
    { _id: 'ph4', imageUrlResolved: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=600', caption: 'Girl children secondary scholarship award' },
    { _id: 'ph5', imageUrlResolved: 'https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?q=80&w=600', caption: 'Deep water borewell installation site' },
    { _id: 'ph6', imageUrlResolved: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600', caption: 'Volunteer coordination meeting' },
    { _id: 'ph7', imageUrlResolved: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=600', caption: 'Student learning materials setup' },
    { _id: 'ph8', imageUrlResolved: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=600', caption: 'Community solar light assembly training' }
  ];

  const list = Array.isArray(photos) && photos.length > 0 ? photos.slice(0, 8) : defaultPhotos;

  return (
    <section 
      ref={ref}
      className={`relative pt-14 pb-32 bg-[#F8F7F4] reveal ${isVisible ? 'visible' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* Title Header */}
        <div className="text-center space-y-4 mb-16 max-w-xl mx-auto">
          <div className="inline-block relative">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#1B5E20] uppercase">
              Moments of Hope
            </span>
            <span className="absolute bottom-[-4px] left-1/4 w-1/2 h-[2px] bg-[#1B5E20] rounded-full" />
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl tracking-tight text-[#0A1628]">
            Moments of Impact
          </h2>
          <p className="text-xs text-[#64748B] font-semibold leading-relaxed">
            Real snapshots of our volunteers, operations, and programs in action across villages and towns.
          </p>
        </div>

        {/* CSS Grid for Photo Masonry with Neumorphic Frames */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            [1,2,3,4].map((n) => (
              <div key={n} className="h-64 bg-gray-150 animate-pulse rounded-3xl" />
            ))
          ) : (
            list.map((ph, idx) => (
              <div 
                key={ph._id}
                className="p-2.5 bg-[#F8F7F4] rounded-3xl transition-all duration-500 hover:-translate-y-1.5 group cursor-pointer border-0 shadow-[6px_6px_15px_#e5e4e1,-6px_-6px_15px_#ffffff] hover:shadow-[10px_10px_25px_#e1e0dd,-10px_-10px_25px_#ffffff]"
              >
                <div className="relative rounded-2xl overflow-hidden h-56 w-full bg-gray-100">
                  {/* Image */}
                  <img 
                    src={ph.imageUrlResolved || ph.imageUrl || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600'} 
                    alt={ph.caption || 'Gallery moment'} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Dark Gradient Overlay with caption text */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-[#0A1628]/35 to-transparent flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-xs font-bold text-left leading-relaxed">
                      {ph.caption || 'Humanitarian Outreach'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* View Full Gallery Link */}
        <div className="text-center pt-8">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 text-xs font-extrabold text-[#0A1628] hover:text-[#1B5E20] transition-colors"
          >
            <span>View Full Impact Gallery</span>
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default GallerySection;
