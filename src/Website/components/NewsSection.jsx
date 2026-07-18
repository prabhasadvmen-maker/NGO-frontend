import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, User } from 'lucide-react';
import usePublicAPI from '../hooks/usePublicAPI';
import useScrollAnimation from '../hooks/useScrollAnimation';

export const NewsSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { data: news, loading } = usePublicAPI('/api/public/cms/news?limit=3');

  // Fallback defaults
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

  const list = Array.isArray(news) && news.length > 0 ? news.slice(0, 3) : defaultNews;
  const featured = list[0];
  const sideArticles = list.slice(1);

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <section 
      ref={ref}
      className={`relative pt-32 pb-14 bg-[#F8F7F4] reveal ${isVisible ? 'visible' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="text-left space-y-4 max-w-xl">
            <div className="inline-block relative">
              <span className="text-[10px] font-bold tracking-[0.25em] text-[#1B5E20] uppercase">
                Media & Updates
              </span>
              <span className="absolute bottom-[-4px] left-0 w-2/3 h-[2px] bg-[#1B5E20] rounded-full" />
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl tracking-tight text-[#0A1628] leading-tight">
              News & Stories
            </h2>
            <p className="text-xs text-[#64748B] font-semibold leading-relaxed">
              Read regular updates from our on-ground operations, announcements, and human stories of transformation.
            </p>
          </div>
          <Link
            to="/news"
            className="flex items-center gap-2 text-xs font-extrabold text-[#0A1628] hover:text-[#1B5E20] transition-colors self-start sm:self-auto"
          >
            <span>View All News</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Magazine Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-4">
          
          {/* Left Column: Featured Large Article (60% width equivalent) */}
          <div className="lg:col-span-7 flex">
            {loading ? (
              <div className="w-full h-[450px] bg-gray-100 animate-pulse rounded-2xl" />
            ) : (
              featured && (
                <div className="rounded-3xl overflow-hidden bg-[#F8F7F4] flex flex-col justify-between transition-all duration-500 hover:-translate-y-1.5 group text-left border-0 shadow-[8px_8px_20px_#e5e4e1,-8px_-8px_20px_#ffffff] hover:shadow-[12px_12px_28px_#e1e0dd,-12px_-12px_28px_#ffffff]">
                  {/* Big Image */}
                  <div className="relative h-[280px] overflow-hidden">
                    <img 
                      src={featured.coverImageUrl || featured.coverImage || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800'} 
                      alt={featured.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <span className="absolute top-4 left-4 px-3 py-1 bg-[#1B5E20]/90 text-white text-[9px] font-bold uppercase tracking-widest rounded-full shadow-md">
                      {featured.category}
                    </span>
                  </div>

                  {/* Text Details */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(featured.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {featured.branch?.name || 'Savitram Foundation'}
                        </span>
                      </div>
                      <h3 className="font-display font-black text-xl sm:text-2xl text-[#0A1628] leading-snug group-hover:text-[#1B5E20] transition-colors line-clamp-2">
                        {featured.title}
                      </h3>
                      <p className="text-xs text-[#64748B] font-medium leading-relaxed line-clamp-3">
                        {featured.content}
                      </p>
                    </div>

                    <div className="pt-6 mt-4 border-t border-gray-150">
                      <Link 
                        to={`/news/${featured._id}`}
                        className="inline-flex items-center gap-2 text-xs font-extrabold text-[#0A1628] hover:text-[#1B5E20] transition-colors"
                      >
                        <span>Read Full Story</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Right Column: Smaller article stack */}
          <div className="lg:col-span-5 flex flex-col gap-6 justify-center">
            {loading ? (
              [1, 2].map((n) => (
                <div key={n} className="h-[210px] bg-gray-100 animate-pulse rounded-2xl" />
              ))
            ) : (
              sideArticles.map((art) => (
                <div 
                  key={art._id}
                  className="rounded-3xl p-5 bg-[#F8F7F4] flex gap-5 transition-all duration-500 hover:-translate-y-1.5 text-left group border-0 shadow-[6px_6px_16px_#e5e4e1,-6px_-6px_16px_#ffffff] hover:shadow-[10px_10px_24px_#e1e0dd,-10px_-10px_24px_#ffffff]"
                >
                  {/* Small Image */}
                  <div className="w-[140px] h-[140px] rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100">
                    <img 
                      src={art.coverImageUrl || art.coverImage || 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=600'} 
                      alt={art.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex flex-col justify-between flex-1 py-1 text-left">
                    <div className="space-y-1.5">
                      <span className="text-[8px] font-black uppercase text-[#1B5E20] tracking-widest">{art.category}</span>
                      <h4 className="font-display font-extrabold text-sm text-[#0A1628] leading-snug group-hover:text-[#1B5E20] transition-colors line-clamp-2">
                        {art.title}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1 mt-1">
                        <Calendar size={10} />
                        {formatDate(art.createdAt)}
                      </p>
                      <p className="text-[11px] text-[#64748B] font-medium leading-relaxed line-clamp-2 mt-1.5">
                        {art.content}
                      </p>
                    </div>

                    <Link 
                      to={`/news/${art._id}`}
                      className="text-[10px] font-extrabold text-[#0A1628] hover:text-[#1B5E20] transition-colors mt-3 block"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

      </div>
    </section>
  );
};

export default NewsSection;
