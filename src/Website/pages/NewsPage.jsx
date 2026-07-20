import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Clock, ArrowRight, Loader } from 'lucide-react';
import usePublicAPI from '../hooks/usePublicAPI';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingUtils from '../components/FloatingUtils';

export const NewsPage = () => {
  const { data: news, loading } = usePublicAPI('/api/public/cms/news?limit=20');
  const [category, setCategory] = useState('All');

  const defaultNews = [
    {
      _id: 'news1',
      title: 'Annual Scholarship Distribution Drive 2026',
      content: 'Today Savitram Foundation successfully organized its annual scholarship distribution drive, assisting over 250 girl students in completing their secondary education.',
      category: 'Education',
      branch: { name: 'Secretary Desk' },
      createdAt: new Date(),
      coverImageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800'
    },
    {
      _id: 'news2',
      title: 'Free Health & Hygiene Camp in Lucknow District',
      content: 'A comprehensive free health checkup camp was set up by our medical volunteers. Free diagnostic screening and sanitization kits were distributed.',
      category: 'Healthcare',
      branch: { name: 'Lucknow Branch' },
      createdAt: new Date(Date.now() - 3600000 * 24 * 3),
      coverImageUrl: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=600'
    },
    {
      _id: 'news3',
      title: 'Empowering Rural Women with Sewing Centers',
      content: 'We opened three new tailoring self-employment center modules to guide local rural women into independent sewing businesses.',
      category: 'Empowerment',
      branch: { name: 'Delhi Branch' },
      createdAt: new Date(Date.now() - 3600000 * 24 * 7),
      coverImageUrl: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=600'
    }
  ];

  const list = Array.isArray(news) && news.length > 0 ? news : defaultNews;

  const filteredList = category === 'All' 
    ? list 
    : list.filter(n => n.category.toLowerCase() === category.toLowerCase());

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-between">
      <SEOHead title="News & Press Stories" description="Read the latest news updates, success stories, and press releases from SAVITRAM FOUNDATION." />
      <Navbar />

      <main className="flex-grow pt-32 pb-24 text-left">
        {/* Header banner */}
        <div className="max-w-7xl mx-auto px-6 py-12 border-b border-gray-200/50 mb-12">
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#1B5E20] uppercase">
            Press Room
          </span>
          <h1 className="font-display font-black text-4xl sm:text-6xl text-[#0A1628] mt-3">
            News & Press releases
          </h1>
          <p className="text-sm text-gray-400 mt-2 font-semibold font-body">Latest updates directly from the field.</p>
        </div>

        {/* Category Filters */}
        <div className="max-w-7xl mx-auto px-6 mb-12 flex flex-wrap gap-4 text-left">
          {['All', 'Education', 'Healthcare', 'Empowerment'].map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border-0 cursor-pointer shadow-[3px_3px_8px_#e5e4e1,-3px_-3px_8px_#ffffff] ${
                category === c 
                  ? 'bg-[#1B5E20] text-white shadow-none' 
                  : 'bg-[#F8F7F4] text-gray-500 hover:text-[#0A1628]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* News Grid */}
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full py-20 flex justify-center">
              <Loader className="animate-spin text-[#1B5E20]" size={36} />
            </div>
          ) : filteredList.length === 0 ? (
            <div className="col-span-full py-20 text-center text-gray-400 font-semibold text-sm">
              No news articles found in this category.
            </div>
          ) : (
            filteredList.map((art) => (
              <div 
                key={art._id}
                className="rounded-3xl overflow-hidden bg-[#F8F7F4] flex flex-col justify-between transition-all duration-500 hover:-translate-y-1.5 group text-left border-0 shadow-[8px_8px_20px_#e5e4e1,-8px_-8px_20px_#ffffff] hover:shadow-[12px_12px_28px_#e1e0dd,-12px_-12px_28px_#ffffff]"
              >
                {/* Thumbnail */}
                <div className="relative h-[200px] overflow-hidden bg-gray-150">
                  <img 
                    src={art.coverImageUrl || art.coverImage || 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=600'} 
                    alt={art.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                    width="384"
                    height="200"
                  />
                  <span className="absolute top-4 left-4 px-2.5 py-0.5 bg-[#1B5E20]/90 text-white text-[8px] font-bold uppercase tracking-widest rounded-full shadow-md">
                    {art.category}
                  </span>
                </div>

                {/* Details */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {formatDate(art.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={11} />
                        <span>{art.branch?.name || 'Savitram Foundation'}</span>
                      </span>
                    </div>
                    <h3 className="font-display font-extrabold text-base text-[#0A1628] leading-snug group-hover:text-[#1B5E20] transition-colors line-clamp-2">
                      {art.title}
                    </h3>
                    <p className="text-xs text-[#64748B] font-medium leading-relaxed line-clamp-3">
                      {art.content}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-150">
                    <Link 
                      to={`/news/${art._id}`}
                      className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#0A1628] hover:text-[#1B5E20] transition-colors"
                    >
                      <span>Read Full Story</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <FloatingUtils />
      <Footer />
    </div>
  );
};

export default NewsPage;
