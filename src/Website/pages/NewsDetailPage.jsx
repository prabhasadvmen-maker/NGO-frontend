import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Share2, Loader, ArrowRight } from 'lucide-react';
import usePublicAPI from '../hooks/usePublicAPI';
import SEOHead from '../components/SEOHead';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingUtils from '../components/FloatingUtils';

export const NewsDetailPage = () => {
  const { slug } = useParams();
  const { data: news, loading } = usePublicAPI('/api/public/cms/news?limit=100');

  // Fallbacks if data list is empty or pending
  const defaultNews = [
    {
      _id: 'news1',
      title: 'Annual Scholarship Distribution Drive 2026',
      content: `Today Savitram Foundation successfully organized its annual scholarship distribution drive at the Lucknow central library hall, assisting over 250 girl students in completing their secondary education.\n\nOur volunteer coordination panel and local branch heads evaluated applicants over the past two months based on income declarations and merit performance. Each student received a set of secondary class textbooks, study materials, and a scholarship check covering their annual school fee structure.\n\nSavitram directors stated, "Education is the single most powerful tool to eradicate generational poverty. By supporting these girls, we secure the future of 250 families." We thank our active donors for supporting this program.`,
      category: 'Education',
      branch: { name: 'Secretary Desk' },
      createdAt: new Date().toISOString(),
      coverImageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200'
    },
    {
      _id: 'news2',
      title: 'Free Health & Hygiene Camp in Lucknow District',
      content: 'A comprehensive free health checkup camp was set up by our medical volunteers. Free diagnostic screening and sanitization kits were distributed.',
      category: 'Healthcare',
      branch: { name: 'Lucknow Branch' },
      createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      coverImageUrl: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=600'
    },
    {
      _id: 'news3',
      title: 'Empowering Rural Women with Sewing Centers',
      content: 'We opened three new tailoring self-employment center modules to guide local rural women into independent sewing businesses.',
      category: 'Empowerment',
      branch: { name: 'Delhi Branch' },
      createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
      coverImageUrl: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=600'
    }
  ];

  const list = Array.isArray(news) && news.length > 0 ? news : defaultNews;
  const article = list.find(n => n._id === slug);

  // Find 2 other related articles
  const related = list.filter(n => n._id !== slug).slice(0, 2);

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Article link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-between">
        <SEOHead title="Loading Story..." />
        <Navbar />
        <div className="flex-grow flex items-center justify-center pt-32 pb-24">
          <Loader className="animate-spin text-[#1B5E20]" size={36} />
        </div>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-between">
        <SEOHead title="Article Not Found" />
        <Navbar />
        <div className="flex-grow max-w-xl mx-auto px-6 pt-40 pb-24 text-center space-y-4">
          <h2 className="font-display font-black text-2xl text-[#0A1628]">Article Not Found</h2>
          <p className="text-xs text-gray-500 font-semibold leading-relaxed">The news story you are looking for does not exist or has been removed from our databases.</p>
          <Link to="/news" className="inline-block px-6 py-2.5 rounded-full bg-[#1B5E20] text-xs font-bold text-white shadow-md">
            Back to Newsroom
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-between">
      <SEOHead 
        title={article.title} 
        description={article.content?.slice(0, 150)} 
        ogType="article"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': [
              {
                '@type': 'ListItem',
                'position': 1,
                'name': 'Home',
                'item': 'https://savitramfoundation.org/'
              },
              {
                '@type': 'ListItem',
                'position': 2,
                'name': 'News',
                'item': 'https://savitramfoundation.org/news'
              },
              {
                '@type': 'ListItem',
                'position': 3,
                'name': article.title,
                'item': `https://savitramfoundation.org/news/${article.slug}`
              }
            ]
          },
          {
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            'headline': article.title,
            'description': article.content?.slice(0, 150),
            'datePublished': article.createdAt,
            'dateModified': article.updatedAt || article.createdAt,
            'author': {
              '@type': 'Organization',
              'name': 'SAVITRAM FOUNDATION',
              'url': 'https://savitramfoundation.org'
            },
            'publisher': {
              '@type': 'NGO',
              'name': 'SAVITRAM FOUNDATION',
              'logo': {
                '@type': 'ImageObject',
                'url': 'https://savitramfoundation.org/NGO logo.jpeg'
              }
            }
          }
        ]}
      />
      <Navbar />

      <main className="flex-grow pt-32 pb-24 text-left">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          
          {/* Back button */}
          <Link to="/news" className="inline-flex items-center gap-2 text-xs font-bold text-[#64748B] hover:text-[#0A1628] transition-colors">
            <ArrowLeft size={14} />
            <span>Back to Newsroom</span>
          </Link>

          {/* Article Header block */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                {article.category}
              </span>
              <div className="flex items-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {formatDate(article.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <User size={12} />
                  <span>{article.branch?.name || 'Savitram Foundation'}</span>
                </span>
              </div>
            </div>

            <h1 className="font-display font-black text-3xl sm:text-5xl text-[#0A1628] leading-tight">
              {article.title}
            </h1>
          </div>

          {/* Large cover image */}
          <div className="h-[380px] w-full rounded-3xl overflow-hidden shadow-lg border border-gray-150">
            <img 
              src={article.coverImageUrl || article.coverImage || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200'} 
              alt={article.title} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Share buttons line */}
          <div className="flex justify-between items-center py-4 border-y border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Savitram Foundation Press Release
            </span>
            <button 
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg hover:bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 transition-colors cursor-pointer"
            >
              <Share2 size={12} />
              <span>Copy Link</span>
            </button>
          </div>

          {/* Content */}
          <div className="text-xs text-[#64748B] font-semibold leading-relaxed whitespace-pre-wrap space-y-4 text-left">
            {article.content}
          </div>

          {/* Related Articles Column */}
          {related.length > 0 && (
            <div className="pt-12 border-t border-gray-250/50 mt-12 space-y-6">
              <h3 className="font-display font-extrabold text-xl text-[#0A1628]">Related Articles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {related.map((art) => (
                  <Link 
                    key={art._id}
                    to={`/news/${art._id}`}
                    className="rounded-2xl p-5 bg-white border border-gray-100 flex gap-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group"
                    style={{ boxShadow: '6px 6px 12px #DCDCDC, -6px -6px 12px #FFFFFF' }}
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <img 
                        src={art.coverImageUrl || art.coverImage || 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=600'} 
                        alt={art.title} 
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform"
                      />
                    </div>
                    <div className="flex flex-col justify-between flex-grow py-0.5 text-left">
                      <div>
                        <span className="text-[8px] font-black uppercase text-[#1B5E20] tracking-widest">{art.category}</span>
                        <h4 className="font-display font-bold text-xs text-[#0A1628] leading-snug group-hover:text-[#1B5E20] transition-colors line-clamp-2 mt-0.5">
                          {art.title}
                        </h4>
                      </div>
                      <span className="text-[9px] font-extrabold text-[#1B5E20] flex items-center gap-1 hover:underline mt-2">
                        Read Story <ArrowRight size={10} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      <FloatingUtils />
      <Footer />
    </div>
  );
};

export default NewsDetailPage;
