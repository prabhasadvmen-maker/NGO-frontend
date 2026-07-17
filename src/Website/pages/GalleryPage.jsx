import React from 'react';
import usePublicAPI from '../hooks/usePublicAPI';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingUtils from '../components/FloatingUtils';
import { Loader } from 'lucide-react';

export const GalleryPage = () => {
  const { data: photos, loading } = usePublicAPI('/api/public/cms/gallery?limit=100');

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

  const list = Array.isArray(photos) && photos.length > 0 ? photos : defaultPhotos;

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-between">
      <SEOHead title="Photo Gallery" description="View moments of impact, health drives, and classroom stories from SAVITRAM FOUNDATION." />
      <Navbar />

      <main className="flex-grow pt-32 pb-24 text-left">
        {/* Banner */}
        <div className="max-w-7xl mx-auto px-6 py-12 border-b border-gray-200/50 mb-12">
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#1B5E20] uppercase">
            Captured Moments
          </span>
          <h1 className="font-display font-black text-4xl sm:text-6xl text-[#0A1628] mt-3">
            Impact Gallery
          </h1>
          <p className="text-sm text-gray-400 mt-2 font-semibold">Visual archives of our rural outreach initiatives.</p>
        </div>

        {/* Photos Grid */}
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader className="animate-spin text-[#1B5E20]" size={36} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {list.map((ph) => (
                <div 
                  key={ph._id}
                  className="relative rounded-2xl overflow-hidden shadow-md group cursor-pointer h-64 border border-gray-100/50 bg-white"
                  style={{ boxShadow: '4px 4px 8px #DCDCDC, -4px -4px 8px #FFFFFF' }}
                >
                  <img 
                    src={ph.imageUrlResolved || ph.imageUrl || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600'} 
                    alt={ph.caption || 'Gallery moment'} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-[#0A1628]/45 to-transparent flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-xs font-bold text-left leading-relaxed">
                      {ph.caption || 'Humanitarian Outreach'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <FloatingUtils />
      <Footer />
    </div>
  );
};

export default GalleryPage;
