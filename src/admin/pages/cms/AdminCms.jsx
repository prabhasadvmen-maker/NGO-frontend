import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Globe, Newspaper, Image, MessageSquare, Mail, Plus, Trash2, Check, X,
  Edit2, Eye, Loader2, Calendar, FileText, FolderKanban, Info, Settings,
  Upload, ImageIcon
} from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../../shared/AuthContext';
import { useToast } from '../../../shared/ToastContext';
import API_BASE_URL from '../../../shared/apiConfig';

const CMS_API = `${API_BASE_URL}/api/admin/cms`;
const PROJECT_API = `${API_BASE_URL}/api/admin/projects`;

// Reusable Image Uploader Component for Admin Panel
const ImageUploader = ({ value, previewUrl, onChange, token, fileType, label, required = false }) => {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(previewUrl || value || '');

  useEffect(() => {
    if (previewUrl) {
      setPreview(previewUrl);
    } else if (value && (value.startsWith('http') || value.startsWith('blob:'))) {
      setPreview(value);
    } else {
      setPreview('');
    }
  }, [value, previewUrl]);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return alert('Only image files allowed');
    setUploading(true);
    try {
      const res = await fetch(
        `${CMS_API}/upload-url?fileName=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}&fileType=${fileType}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const json = await res.json();
      if (!json.success) throw new Error('Failed to get upload URL');
      await fetch(json.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      const localUrl = URL.createObjectURL(file);
      setPreview(localUrl);
      onChange(json.key, localUrl);
    } catch (err) {
      alert('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-1.5 text-left">
      {label && <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">{label}{required && ' *'}</label>}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50/50">
        {preview
          ? <img src={preview} alt="preview" className="w-8 h-8 rounded-lg object-cover border border-gray-200 shrink-0" />
          : <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"><ImageIcon size={14} className="text-gray-300" /></div>
        }
        <span className="flex-1 text-xs text-gray-400 font-semibold truncate">
          {preview ? 'Image selected' : 'No image chosen'}
        </span>
        <button
          type="button"
          onClick={() => !uploading && inputRef.current.click()}
          disabled={uploading}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-[11px] font-bold text-gray-600 hover:border-green-400 hover:text-green-700 cursor-pointer shrink-0"
        >
          {uploading ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />}
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
    </div>
  );
};

const AdminCms = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from path
  const getTabFromPath = (path) => {
    if (path.includes('/homepage')) return 'homepage';
    if (path.includes('/projects')) return 'projects';
    if (path.includes('/news')) return 'news';
    if (path.includes('/gallery')) return 'gallery';
    if (path.includes('/testimonials')) return 'testimonials';
    if (path.includes('/contact')) return 'queries';
    return 'homepage';
  };

  const activeTab = getTabFromPath(location.pathname);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Data lists
  const [newsPosts, setNewsPosts] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [queries, setQueries] = useState([]);
  const [projects, setProjects] = useState([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Forms
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [newsForm, setNewsForm] = useState({
    title: '',
    content: '',
    coverImage: '',
    coverImagePreview: '',
    category: 'General',
    status: 'Draft'
  });

  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [galleryForm, setGalleryForm] = useState({
    imageUrl: '',
    imageUrlPreview: '',
    caption: '',
    category: 'General'
  });

  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState({
    name: '',
    role: 'Donor',
    message: '',
    avatar: '',
    avatarPreview: ''
  });

  const [selectedQuery, setSelectedQuery] = useState(null);

  // Consolidated fetch helper
  const fetchAPI = useCallback(async (url, options = {}) => {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        }
      });
      if (!res.ok) {
        if (res.status === 429) {
          toast.error('Too many requests. Please wait a moment.');
        } else {
          console.error(`API Error ${res.status}: ${res.statusText}`);
        }
        return null;
      }
      return await res.json();
    } catch (err) {
      console.error('Admin CMS Fetch error:', err);
      return null;
    }
  }, [token, toast]);

  // Load data for active tab
  const loadTabData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'projects') {
        const json = await fetchAPI(`${PROJECT_API}?page=${page}&limit=10`);
        if (json && json.success) {
          setProjects(json.data || []);
          setTotalPages(json.pagination.totalPages);
        }
      } else if (activeTab === 'news') {
        const json = await fetchAPI(`${CMS_API}/news?page=${page}&limit=10`);
        if (json && json.success) {
          setNewsPosts(json.data || []);
          setTotalPages(json.pagination.totalPages);
        }
      } else if (activeTab === 'gallery') {
        const json = await fetchAPI(`${CMS_API}/gallery?page=${page}&limit=12`);
        if (json && json.success) {
          setGalleryItems(json.data || []);
          setTotalPages(json.pagination.totalPages);
        }
      } else if (activeTab === 'testimonials') {
        const json = await fetchAPI(`${CMS_API}/testimonials?page=${page}&limit=10`);
        if (json && json.success) {
          setTestimonials(json.data || []);
          setTotalPages(json.pagination.totalPages);
        }
      } else if (activeTab === 'queries') {
        const json = await fetchAPI(`${CMS_API}/queries?page=${page}&limit=10`);
        if (json && json.success) {
          setQueries(json.data || []);
          setTotalPages(json.pagination.totalPages);
        }
      }
    } catch (err) {
      toast.error('Failed to load branch CMS items');
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, fetchAPI, toast]);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  useEffect(() => {
    loadTabData();
  }, [loadTabData]);

  // News Post Submit
  const handleNewsSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { coverImagePreview, ...payload } = newsForm;
      const url = editingNews ? `${CMS_API}/news/${editingNews._id}` : `${CMS_API}/news`;
      const method = editingNews ? 'PUT' : 'POST';
      const data = await fetchAPI(url, {
        method,
        body: JSON.stringify(payload)
      });
      if (data && data.success) {
        toast.success(editingNews ? 'Article contribution updated' : 'Article contribution posted');
        setIsNewsModalOpen(false);
        setEditingNews(null);
        loadTabData();
      }
    } catch (err) {
      toast.error('Failed to save article');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditNewsClick = (post) => {
    setEditingNews(post);
    setNewsForm({
      title: post.title,
      content: post.content,
      coverImage: post.coverImage || '',
      coverImagePreview: post.coverImageUrl || post.coverImage || '',
      category: post.category || 'General',
      status: post.status || 'Draft'
    });
    setIsNewsModalOpen(true);
  };

  const handleDeleteNews = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    const data = await fetchAPI(`${CMS_API}/news/${id}`, { method: 'DELETE' });
    if (data && data.success) {
      toast.success('Article deleted');
      loadTabData();
    }
  };

  // Gallery Item Submit
  const handleGallerySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { imageUrlPreview, ...payload } = galleryForm;
      const data = await fetchAPI(`${CMS_API}/gallery`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (data && data.success) {
        toast.success('Photo uploaded to branch gallery');
        setIsGalleryModalOpen(false);
        setGalleryForm({ imageUrl: '', imageUrlPreview: '', caption: '', category: 'General' });
        loadTabData();
      }
    } catch (err) {
      toast.error('Failed to upload photo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGalleryItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;
    const data = await fetchAPI(`${CMS_API}/gallery/${id}`, { method: 'DELETE' });
    if (data && data.success) {
      toast.success('Photo deleted');
      loadTabData();
    }
  };

  // Testimonial Submit
  const handleTestimonialSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { avatarPreview, ...payload } = testimonialForm;
      const data = await fetchAPI(`${CMS_API}/testimonials`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (data && data.success) {
        toast.success('Testimonial submitted and pending Super Admin approval');
        setIsTestimonialModalOpen(false);
        setTestimonialForm({ name: '', role: 'Donor', message: '', avatar: '', avatarPreview: '' });
        loadTabData();
      }
    } catch (err) {
      toast.error('Failed to submit quote');
    } finally {
      setSubmitting(false);
    }
  };

  // Contact Query Actions
  const handleUpdateQueryStatus = async (id, status) => {
    const data = await fetchAPI(`${CMS_API}/queries/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    if (data && data.success) {
      toast.success(`Query set to ${status}`);
      if (selectedQuery && selectedQuery._id === id) {
        setSelectedQuery(data.data);
      }
      loadTabData();
    }
  };

  const handleTabChange = (tabId) => {
    const pathMap = {
      homepage: '/admin/cms/homepage',
      projects: '/admin/cms/projects',
      news: '/admin/cms/news',
      gallery: '/admin/cms/gallery',
      testimonials: '/admin/cms/testimonials',
      queries: '/admin/cms/contact'
    };
    navigate(pathMap[tabId]);
  };

  return (
    <Layout>
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <Globe className="text-[#1B5E20]" size={28} />
              Branch Website CMS
            </h1>
            <p className="text-xs text-gray-400 font-bold mt-1">
              Contribute blog updates, upload branch gallery photos, log reviews, and respond to routed contact requests
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {activeTab === 'news' && (
              <button
                onClick={() => {
                  setEditingNews(null);
                  setNewsForm({ title: '', content: '', coverImage: '', category: 'General', status: 'Draft' });
                  setIsNewsModalOpen(true);
                }}
                className="px-4 py-2.5 bg-[#1B5E20] text-white rounded-xl text-xs font-bold shadow-lg hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer border-0"
              >
                <Plus size={16} /> Contribute Article
              </button>
            )}
            {activeTab === 'gallery' && (
              <button
                onClick={() => setIsGalleryModalOpen(true)}
                className="px-4 py-2.5 bg-[#1B5E20] text-white rounded-xl text-xs font-bold shadow-lg hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer border-0"
              >
                <Plus size={16} /> Upload Photo
              </button>
            )}
            {activeTab === 'testimonials' && (
              <button
                onClick={() => setIsTestimonialModalOpen(true)}
                className="px-4 py-2.5 bg-[#1B5E20] text-white rounded-xl text-xs font-bold shadow-lg hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer border-0"
              >
                <Plus size={16} /> Log Testimonial
              </button>
            )}
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-gray-200 gap-6">
          {[
            { id: 'homepage', label: 'Overview', icon: Info },
            { id: 'projects', label: 'Projects Showcase', icon: FolderKanban },
            { id: 'news', label: 'News Contributions', icon: Newspaper },
            { id: 'gallery', label: 'Branch Gallery', icon: Image },
            { id: 'testimonials', label: 'Testimonials logs', icon: MessageSquare },
            { id: 'queries', label: 'Routed Queries', icon: Mail }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-3 px-1 border-b-2 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer bg-transparent border-0 ${
                  activeTab === tab.id
                    ? 'border-[#1B5E20] text-[#1B5E20]'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Loading Spinner */}
        {loading && activeTab !== 'homepage' ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="animate-spin text-[#1B5E20]" size={40} />
            <p className="text-xs text-gray-400 font-bold">Loading branch CMS logs...</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm min-h-[40vh]">
            
            {/* Tab: Overview */}
            {activeTab === 'homepage' && (
              <div className="space-y-6 max-w-3xl">
                <div className="bg-green-50/50 border border-green-100 p-5 rounded-2xl space-y-2">
                  <h3 className="text-sm font-bold text-green-800 flex items-center gap-2">
                    <Globe size={18} /> Public Website Content Submissions
                  </h3>
                  <p className="text-xs text-gray-600 font-semibold leading-relaxed">
                    Welcome to the Branch CMS module! As a Branch Admin, you can contribute articles, news highlights, and gallery photos scoped specifically to your local branch drives. Superadmin reviews testimonial requests and updates main homepage configurations.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="border border-gray-100 p-5 rounded-2xl space-y-1 bg-gray-50/50">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Local Branch News Posts</span>
                    <p className="text-2xl font-black text-gray-800">{newsPosts.length || 0} Articles</p>
                  </div>
                  <div className="border border-gray-100 p-5 rounded-2xl space-y-1 bg-gray-50/50">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Local Gallery Assets</span>
                    <p className="text-2xl font-black text-gray-800">{galleryItems.length || 0} Images</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Projects Showcase */}
            {activeTab === 'projects' && (
              <div className="space-y-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-gray-500" style={{ borderColor: '#E0E0E0' }}>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-left">Project Title</th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-left">Category</th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-left">Status</th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-left">Start Date</th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-left">Budget</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-10 text-gray-400 font-semibold">No active projects found.</td>
                        </tr>
                      ) : (
                        projects.map((proj) => (
                          <tr key={proj._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F0F0F0' }}>
                            <td className="px-4 py-4 font-bold text-gray-800">{proj.title}</td>
                            <td className="px-4 py-4 text-xs font-semibold text-gray-500">{proj.category || 'General'}</td>
                            <td className="px-4 py-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                proj.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                proj.status === 'Active' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                'bg-orange-50 text-orange-700 border-orange-200'
                              }`}>
                                {proj.status}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-xs font-semibold text-gray-500">
                              {new Date(proj.startDate).toLocaleDateString('en-IN')}
                            </td>
                            <td className="px-4 py-4 text-xs font-bold text-green-700">
                              ₹{proj.budget ? proj.budget.toLocaleString('en-IN') : '0'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab: News Contributions */}
            {activeTab === 'news' && (
              <div className="space-y-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-gray-500" style={{ borderColor: '#E0E0E0' }}>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-left">Cover</th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-left">Title</th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-left">Category</th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-left">Status</th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-left">Created Date</th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-right pr-6">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newsPosts.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-10 text-gray-400 font-semibold">No contributed news posts.</td>
                        </tr>
                      ) : (
                        newsPosts.map((post) => (
                          <tr key={post._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F0F0F0' }}>
                            <td className="px-4 py-4">
                              <img
                                src={post.coverImageUrl || post.coverImage || 'https://placehold.co/100x60/f3f4f6/9ca3af?text=No+Cover'}
                                alt="cover"
                                className="w-16 h-10 object-cover rounded-lg border border-gray-100"
                              />
                            </td>
                            <td className="px-4 py-4 font-bold text-gray-800">{post.title}</td>
                            <td className="px-4 py-4 text-xs font-bold text-gray-500">{post.category}</td>
                            <td className="px-4 py-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                post.status === 'Published'
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : 'bg-orange-50 text-orange-700 border-orange-200'
                              }`}>
                                {post.status}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-xs font-semibold text-gray-400">
                              {new Date(post.createdAt).toLocaleDateString('en-IN')}
                            </td>
                            <td className="px-4 py-4 text-right pr-6">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleEditNewsClick(post)}
                                  className="p-1.5 rounded hover:bg-green-50 text-green-700 border border-green-200 bg-white cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteNews(post._id)}
                                  className="p-1.5 rounded hover:bg-red-50 text-red-500 border border-red-200 bg-white cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab: Branch Gallery */}
            {activeTab === 'gallery' && (
              <div className="space-y-6">
                {galleryItems.length === 0 ? (
                  <div className="text-center py-20 text-gray-400 font-semibold">No branch photos uploaded.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {galleryItems.map((item) => (
                      <div key={item._id} className="group relative bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                        <img
                          src={item.imageUrlResolved || item.imageUrl}
                          alt={item.caption}
                          className="w-full h-40 object-cover"
                        />
                        <div className="p-3.5 space-y-1.5">
                          <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-600 font-bold text-[9px] uppercase tracking-wider">
                            {item.category}
                          </span>
                          <p className="text-xs font-bold text-gray-800 line-clamp-1">{item.caption || 'No Caption'}</p>
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleDeleteGalleryItem(item._id)}
                            className="p-2 bg-white/90 text-red-600 hover:text-red-700 hover:bg-white rounded-xl shadow-lg border-0 cursor-pointer"
                            title="Delete Image"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Testimonials */}
            {activeTab === 'testimonials' && (
              <div className="space-y-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-gray-500" style={{ borderColor: '#E0E0E0' }}>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-left">Visitor Name</th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-left">Quote Message</th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-left">Moderation Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testimonials.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="text-center py-10 text-gray-400 font-semibold">No logged testimonials.</td>
                        </tr>
                      ) : (
                        testimonials.map((test) => (
                          <tr key={test._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F0F0F0' }}>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={test.avatarUrlResolved || test.avatar || 'https://placehold.co/40x40/f3f4f6/9ca3af?text=Pic'}
                                  alt="avatar"
                                  className="w-9 h-9 object-cover rounded-full border border-gray-100"
                                />
                                <div>
                                  <p className="font-bold text-gray-800">{test.name}</p>
                                  <p className="text-[10px] text-gray-400 font-bold">{test.role}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-xs text-gray-600 italic line-clamp-2 max-w-md">
                              "{test.message}"
                            </td>
                            <td className="px-4 py-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                test.isApproved
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : 'bg-orange-50 text-orange-700 border-orange-200'
                              }`}>
                                {test.isApproved ? 'Approved & Public' : 'Pending Super Admin Approval'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab: Routed Queries */}
            {activeTab === 'queries' && (
              <div className="space-y-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-gray-500" style={{ borderColor: '#E0E0E0' }}>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-left">Sender</th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-left">Subject</th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-left">Status</th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-left">Received Date</th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-right pr-6">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {queries.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-10 text-gray-400 font-semibold">No inquiries routed to this branch.</td>
                        </tr>
                      ) : (
                        queries.map((q) => (
                          <tr key={q._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F0F0F0' }}>
                            <td className="px-4 py-4 font-bold text-gray-800">
                              {q.name}
                              <p className="text-[10px] text-gray-400 font-bold font-mono">{q.email}</p>
                            </td>
                            <td className="px-4 py-4 text-xs font-bold text-gray-600 line-clamp-1">{q.subject}</td>
                            <td className="px-4 py-4">
                              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                                q.status === 'Replied'
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : q.status === 'Read'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-red-50 text-red-700 border-red-200'
                              }`}>
                                {q.status}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-xs font-semibold text-gray-400">
                              {new Date(q.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                            </td>
                            <td className="px-4 py-4 text-right pr-6">
                              <button
                                onClick={() => setSelectedQuery(q)}
                                className="p-1.5 rounded hover:bg-green-50 text-green-700 border border-green-200 bg-white cursor-pointer"
                                title="View Message"
                              >
                                <Eye size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* MODALS */}

      {/* 1. News Article Contribute Modal */}
      {isNewsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 overflow-y-auto no-scrollbar">
          <div className="w-full max-w-2xl bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-extrabold text-gray-800">{editingNews ? 'Edit News Contribution' : 'Write News Contribution'}</h3>
                <p className="text-xs text-gray-400 mt-0.5 font-bold">Write news highlights scoped to this branch</p>
              </div>
              <button onClick={() => setIsNewsModalOpen(false)} className="p-1 rounded hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleNewsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Article Title *</label>
                <input
                  type="text" required placeholder=" Lucknow Branch Project Launch"
                  value={newsForm.title}
                  onChange={(e) => setNewsForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Category</label>
                  <input
                    type="text" placeholder="e.g. Welfare, Launch"
                    value={newsForm.category}
                    onChange={(e) => setNewsForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Publish Status</label>
                  <select
                    value={newsForm.status}
                    onChange={(e) => setNewsForm(p => ({ ...p, status: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <ImageUploader
                  value={newsForm.coverImage}
                  previewUrl={newsForm.coverImagePreview}
                  onChange={(key, previewUrl) => setNewsForm(p => ({ ...p, coverImage: key, coverImagePreview: previewUrl }))}
                  token={token}
                  fileType="news"
                  label="Cover Image"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Content Editor *</label>
                <textarea
                  required placeholder="Describe the news in detail..."
                  value={newsForm.content}
                  onChange={(e) => setNewsForm(p => ({ ...p, content: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50 h-32"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button" onClick={() => setIsNewsModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={submitting}
                  className="flex-1 py-3 border-0 rounded-xl text-sm font-bold text-white cursor-pointer bg-[#1B5E20] hover:opacity-90 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  {editingNews ? 'Update' : 'Contribute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Gallery Upload Modal */}
      {isGalleryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 overflow-y-auto no-scrollbar">
          <div className="w-full max-w-xl bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-extrabold text-gray-800">Upload Photo</h3>
                <p className="text-xs text-gray-400 mt-0.5 font-bold">Publish branch project photos in the public photo grid</p>
              </div>
              <button onClick={() => setIsGalleryModalOpen(false)} className="p-1 rounded hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleGallerySubmit} className="space-y-4">
              <ImageUploader
                value={galleryForm.imageUrl}
                previewUrl={galleryForm.imageUrlPreview}
                onChange={(key, previewUrl) => setGalleryForm(p => ({ ...p, imageUrl: key, imageUrlPreview: previewUrl }))}
                token={token}
                fileType="gallery"
                label="Gallery Image"
                required
              />

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Caption / Description</label>
                <input
                  type="text" placeholder="Short description of the photo"
                  value={galleryForm.caption}
                  onChange={(e) => setGalleryForm(p => ({ ...p, caption: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button" onClick={() => setIsGalleryModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={submitting}
                  className="flex-1 py-3 border-0 rounded-xl text-sm font-bold text-white cursor-pointer bg-[#1B5E20] hover:opacity-90 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Log Testimonial Modal */}
      {isTestimonialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 overflow-y-auto no-scrollbar">
          <div className="w-full max-w-xl bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-extrabold text-gray-800">Add Testimonial Quote</h3>
                <p className="text-xs text-gray-400 mt-0.5 font-bold">Quotes will be queued for Superadmin approval</p>
              </div>
              <button onClick={() => setIsTestimonialModalOpen(false)} className="p-1 rounded hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleTestimonialSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Author Name *</label>
                  <input
                    type="text" required placeholder="e.g. Shivani Sharma"
                    value={testimonialForm.name}
                    onChange={(e) => setTestimonialForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Author Role *</label>
                  <select
                    value={testimonialForm.role}
                    onChange={(e) => setTestimonialForm(p => ({ ...p, role: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer"
                  >
                    <option value="Donor">Donor</option>
                    <option value="Volunteer">Volunteer</option>
                    <option value="Beneficiary">Beneficiary</option>
                    <option value="Partner">Partner</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <ImageUploader
                  value={testimonialForm.avatar}
                  previewUrl={testimonialForm.avatarPreview}
                  onChange={(key, previewUrl) => setTestimonialForm(p => ({ ...p, avatar: key, avatarPreview: previewUrl }))}
                  token={token}
                  fileType="testimonial"
                  label="Avatar Image"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Quote Message *</label>
                <textarea
                  required placeholder="What feedback did they share about our branch drives?"
                  value={testimonialForm.message}
                  onChange={(e) => setTestimonialForm(p => ({ ...p, message: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50 h-24"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button" onClick={() => setIsTestimonialModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={submitting}
                  className="flex-1 py-3 border-0 rounded-xl text-sm font-bold text-white cursor-pointer bg-[#1B5E20] hover:opacity-90 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  Submit Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Query Details Dialog */}
      {selectedQuery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 overflow-y-auto no-scrollbar">
          <div className="w-full max-w-xl bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-extrabold text-gray-800">Routed Query Details</h3>
                <p className="text-xs text-gray-400 mt-0.5 font-bold font-mono">Visitor email: {selectedQuery.email}</p>
              </div>
              <button onClick={() => setSelectedQuery(null)} className="p-1 rounded hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl space-y-1">
                <span className="block text-[10px] font-bold text-gray-400 uppercase">Sender</span>
                <span className="font-bold text-gray-800">{selectedQuery.name}</span>
                <span className="block text-[10px] text-gray-400 font-bold">{selectedQuery.phone || 'No phone'}</span>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Subject</span>
                <span className="font-bold text-gray-800">{selectedQuery.subject}</span>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Message Content</span>
                <p className="text-xs text-gray-600 bg-gray-50/50 p-3 rounded-xl border border-gray-100 italic font-semibold">
                  "{selectedQuery.message}"
                </p>
              </div>

              {/* Remarks/Response notes */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Local Response Notes</label>
                <textarea
                  value={selectedQuery.notes}
                  onChange={async (e) => {
                    const val = e.target.value;
                    setSelectedQuery(p => ({ ...p, notes: val }));
                    await fetchAPI(`${CMS_API}/queries/${selectedQuery._id}`, {
                      method: 'PUT',
                      body: JSON.stringify({ notes: val })
                    });
                  }}
                  placeholder="Record local follow up details here..."
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50 h-20 resize-none font-semibold text-gray-700"
                />
              </div>

              {/* Status toggles */}
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-400 uppercase">Status:</span>
                <div className="flex gap-2">
                  {['Unread', 'Read', 'Replied'].map(st => (
                    <button
                      key={st}
                      onClick={() => handleUpdateQueryStatus(selectedQuery._id, st)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        selectedQuery.status === st
                          ? 'bg-[#1B5E20] text-white border-[#1B5E20]'
                          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-gray-100">
                <button
                  type="button" onClick={() => setSelectedQuery(null)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 cursor-pointer bg-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
};

export default AdminCms;
