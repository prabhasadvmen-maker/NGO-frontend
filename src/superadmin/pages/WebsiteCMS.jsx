import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Globe, Settings, Newspaper, Image, MessageSquare, Mail, Plus, Trash2, Check, X,
  Edit2, Eye, Loader2, Link2, Upload, ImageIcon
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../../shared/AuthContext';
import { useToast } from '../../shared/ToastContext';
import API_BASE_URL from '../../shared/apiConfig';

const CMS_API = `${API_BASE_URL}/api/superadmin/cms`;
const BRANCH_API = `${API_BASE_URL}/api/superadmin/branches`;

// Reusable Image Uploader Component
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
    <div className="space-y-1.5">
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

const WebsiteCMS = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('homepage'); // homepage, news, gallery, testimonials, queries
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Data stores
  const [branches, setBranches] = useState([]);
  const [newsPosts, setNewsPosts] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [queries, setQueries] = useState([]);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 1. Homepage Config Settings Form
  const [configForm, setConfigForm] = useState({
    heroTitle: '',
    heroSubtitle: '',
    heroImage: '',      // R2 key — sent to backend
    heroImagePreview: '', // presigned URL — only for display
    mission: '',
    vision: '',
    stats: {
      livesImpacted: 0,
      volunteersCount: 0,
      projectsCompleted: 0
    }
  });

  // 2. News/Blogs Modals & Forms
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [viewingNews, setViewingNews] = useState(null);
  const [openNewsMenu, setOpenNewsMenu] = useState(null);
  const [viewingTestimonial, setViewingTestimonial] = useState(null);
  const [openTestimonialMenu, setOpenTestimonialMenu] = useState(null);
  const [editingNews, setEditingNews] = useState(null);
  const [newsForm, setNewsForm] = useState({
    title: '',
    content: '',
    coverImage: '',
    coverImagePreview: '',
    category: 'General',
    status: 'Draft',
    branch: ''
  });

  // 3. Gallery Modals & Forms
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [viewingGallery, setViewingGallery] = useState(null);
  const [editingGallery, setEditingGallery] = useState(null);
  const [openGalleryMenu, setOpenGalleryMenu] = useState(null);
  const [galleryForm, setGalleryForm] = useState({
    imageUrl: '',
    imageUrlPreview: '',
    caption: '',
    category: 'General',
    branch: ''
  });
  const [galleryEditForm, setGalleryEditForm] = useState({
    imageUrl: '',
    imageUrlPreview: '',
    caption: '',
    category: 'General',
    branch: ''
  });

  // 4. Testimonials Modals & Forms
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState({
    name: '',
    role: 'Donor',
    message: '',
    avatar: '',
    avatarPreview: '',
    branch: '',
    isApproved: true
  });

  // 0. Homepage Config Modal
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // 5. Query Management Modals
  const [selectedQuery, setSelectedQuery] = useState(null);

  // Consolidated rate-limit-resistant fetch helper
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
          const errBody = await res.json().catch(() => ({}));
          console.error(`API Error ${res.status}:`, errBody);
          toast.error(errBody?.message || `Error ${res.status}`);
        }
        return null;
      }
      return await res.json();
    } catch (err) {
      console.error('CMS Fetch error:', err);
      return null;
    }
  }, [token, toast]);

  // Load basic branches for selections
  const fetchBranches = useCallback(async () => {
    const data = await fetchAPI(BRANCH_API);
    if (data && data.success) setBranches(data.data || []);
  }, [fetchAPI]);

  // Load active tab data
  const loadTabData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'homepage') {
        const json = await fetchAPI(`${CMS_API}/config`);
        if (json && json.success) {
          setConfigForm({
            heroTitle: json.data.heroTitle || '',
            heroSubtitle: json.data.heroSubtitle || '',
            heroImage: json.data.heroImage || '',           // raw R2 key
            heroImagePreview: json.data.heroImageUrl || '', // presigned URL for preview
            mission: json.data.mission || '',
            vision: json.data.vision || '',
            stats: {
              livesImpacted: json.data.stats?.livesImpacted || 0,
              volunteersCount: json.data.stats?.volunteersCount || 0,
              projectsCompleted: json.data.stats?.projectsCompleted || 0
            }
          });
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
      toast.error('Failed to load CMS content');
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, fetchAPI, toast]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  useEffect(() => {
    loadTabData();
  }, [loadTabData]);

  // Homepage Config Update
  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { heroImagePreview, ...payload } = configForm;
      const data = await fetchAPI(`${CMS_API}/config`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      if (data && data.success) {
        toast.success('Homepage Settings updated successfully!');
      } else {
        toast.error(data?.message || 'Failed to update Settings');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  // News Post Submit (Create/Update)
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
        toast.success(editingNews ? 'News article updated' : 'News article created');
        setIsNewsModalOpen(false);
        setEditingNews(null);
        loadTabData();
      }
    } catch (err) {
      toast.error('Submit failed');
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
      status: post.status || 'Draft',
      branch: post.branch?._id || post.branch || ''
    });
    setIsNewsModalOpen(true);
  };

  const handleDeleteNews = async (id) => {
    if (!window.confirm('Are you sure you want to delete this news article?')) return;
    const data = await fetchAPI(`${CMS_API}/news/${id}`, { method: 'DELETE' });
    if (data && data.success) {
      toast.success('Article deleted');
      loadTabData();
    }
  };

  // Gallery Item Submit
  const handleGallerySubmit = async (e) => {
    e.preventDefault();
    if (!galleryForm.imageUrl) return toast.error('Please upload an image first');
    setSubmitting(true);
    try {
      const { imageUrlPreview, ...payload } = galleryForm;
      const data = await fetchAPI(`${CMS_API}/gallery`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (data && data.success) {
        toast.success('Gallery photo added successfully');
        setIsGalleryModalOpen(false);
        setGalleryForm({ imageUrl: '', imageUrlPreview: '', caption: '', category: 'General', branch: '' });
        loadTabData();
      }
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGalleryItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;
    const data = await fetchAPI(`${CMS_API}/gallery/${id}`, { method: 'DELETE' });
    if (data && data.success) {
      toast.success('Photo deleted from gallery');
      loadTabData();
    }
  };

  const handleEditGalleryClick = (item) => {
    setEditingGallery(item);
    setGalleryEditForm({
      imageUrl: item.imageUrl || '',
      imageUrlPreview: item.imageUrlResolved || item.imageUrl || '',
      caption: item.caption || '',
      category: item.category || 'General',
      branch: item.branch?._id || item.branch || ''
    });
  };

  const handleGalleryEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { imageUrlPreview, ...payload } = galleryEditForm;
      const data = await fetchAPI(`${CMS_API}/gallery/${editingGallery._id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      if (data && data.success) {
        toast.success('Gallery item updated');
        setEditingGallery(null);
        loadTabData();
      }
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setSubmitting(false);
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
        toast.success('Testimonial recorded successfully');
        setIsTestimonialModalOpen(false);
        setTestimonialForm({ name: '', role: 'Donor', message: '', avatar: '', avatarPreview: '', branch: '', isApproved: true });
        loadTabData();
      }
    } catch (err) {
      toast.error('Failed to save testimonial');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleApproveTestimonial = async (id, currentStatus) => {
    const data = await fetchAPI(`${CMS_API}/testimonials/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ isApproved: !currentStatus })
    });
    if (data && data.success) {
      toast.success(currentStatus ? 'Testimonial set to pending' : 'Testimonial approved successfully');
      loadTabData();
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    const data = await fetchAPI(`${CMS_API}/testimonials/${id}`, { method: 'DELETE' });
    if (data && data.success) {
      toast.success('Testimonial record deleted');
      loadTabData();
    }
  };

  // Query Inbox Actions
  const handleUpdateQueryStatus = async (id, status) => {
    const data = await fetchAPI(`${CMS_API}/queries/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    if (data && data.success) {
      toast.success(`Query marked as ${status}`);
      if (selectedQuery && selectedQuery._id === id) {
        setSelectedQuery(data.data);
      }
      loadTabData();
    }
  };

  const handleDeleteQuery = async (id) => {
    if (!window.confirm('Are you sure you want to delete this query from the inbox?')) return;
    const data = await fetchAPI(`${CMS_API}/queries/${id}`, { method: 'DELETE' });
    if (data && data.success) {
      toast.success('Inquiry deleted');
      setSelectedQuery(null);
      loadTabData();
    }
  };

  return (
    <Layout>
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <Globe className="text-[#1B5E20]" size={28} />
              Website CMS Manager
            </h1>
            <p className="text-xs text-gray-400 font-bold mt-1">
              Control the public presence, blogs, news feeds, gallery showcase, and visitor feedback of the NGO
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {activeTab === 'homepage' && (
              <button
                onClick={() => setIsConfigModalOpen(true)}
                className="px-4 py-2.5 bg-[#1B5E20] text-white rounded-xl text-xs font-bold shadow-lg hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer border-0"
              >
                <Edit2 size={16} /> Edit Config
              </button>
            )}
            {activeTab === 'news' && (
              <button
                onClick={() => {
                  setEditingNews(null);
                  setNewsForm({ title: '', content: '', coverImage: '', category: 'General', status: 'Draft', branch: '' });
                  setIsNewsModalOpen(true);
                }}
                className="px-4 py-2.5 bg-[#1B5E20] text-white rounded-xl text-xs font-bold shadow-lg hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer border-0"
              >
                <Plus size={16} /> Write Article
              </button>
            )}
            {activeTab === 'gallery' && (
              <button
                onClick={() => setIsGalleryModalOpen(true)}
                className="px-4 py-2.5 bg-[#1B5E20] text-white rounded-xl text-xs font-bold shadow-lg hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer border-0"
              >
                <Plus size={16} /> Add Photo
              </button>
            )}
            {activeTab === 'testimonials' && (
              <button
                onClick={() => setIsTestimonialModalOpen(true)}
                className="px-4 py-2.5 bg-[#1B5E20] text-white rounded-xl text-xs font-bold shadow-lg hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer border-0"
              >
                <Plus size={16} /> Add Testimonial
              </button>
            )}
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-gray-200 gap-6">
          {[
            { id: 'homepage', label: 'Homepage Config', icon: Settings },
            { id: 'news', label: 'News & Blogs', icon: Newspaper },
            { id: 'gallery', label: 'Gallery Grid', icon: Image },
            { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
            { id: 'queries', label: 'Contact Queries', icon: Mail }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="animate-spin text-[#1B5E20]" size={40} />
            <p className="text-xs text-gray-400 font-bold">Synchronizing CMS Content Feed...</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm min-h-[50vh]">
            
            {/* Tab: Homepage Config — Summary View */}
            {activeTab === 'homepage' && (
              <div className="space-y-6 max-w-4xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Hero Title</p>
                    <p className="text-sm font-bold text-gray-800">{configForm.heroTitle || '—'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Hero Banner</p>
                    {configForm.heroImagePreview || configForm.heroImage
                      ? <img src={configForm.heroImagePreview || configForm.heroImage} className="h-10 rounded-lg object-cover" alt="banner" />
                      : <p className="text-xs text-gray-400 font-semibold">No image set</p>}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Hero Subtitle</p>
                  <p className="text-sm text-gray-700 font-semibold">{configForm.heroSubtitle || '—'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Mission</p>
                    <p className="text-xs text-gray-700 font-semibold">{configForm.mission || '—'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Vision</p>
                    <p className="text-xs text-gray-700 font-semibold">{configForm.vision || '—'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[['Lives Impacted', configForm.stats.livesImpacted], ['Active Volunteers', configForm.stats.volunteersCount], ['Completed Projects', configForm.stats.projectsCompleted]].map(([label, val]) => (
                    <div key={label} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                      <p className="text-2xl font-extrabold text-[#1B5E20]">{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: News & Blogs */}
            {activeTab === 'news' && (
              <div className="space-y-6" onClick={() => setOpenNewsMenu(null)}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-gray-500" style={{ borderColor: '#E0E0E0' }}>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-left w-10">Sr.</th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-left">Cover</th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-left">Title</th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-left">Category</th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-left">Branch</th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-left">Status</th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-left">Date</th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-right pr-6">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newsPosts.length === 0 ? (
                        <tr><td colSpan="8" className="text-center py-10 text-gray-400 font-semibold">No news articles found.</td></tr>
                      ) : (
                        newsPosts.map((post, idx) => (
                          <tr key={post._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F0F0F0' }}>
                            <td className="px-4 py-4 text-xs font-bold text-gray-400">{(page - 1) * 10 + idx + 1}</td>
                            <td className="px-4 py-4">
                              <img
                                src={post.coverImageUrl || post.coverImage || 'https://placehold.co/100x60/f3f4f6/9ca3af?text=No+Cover'}
                                alt="cover" className="w-16 h-10 object-cover rounded-lg border border-gray-100"
                              />
                            </td>
                            <td className="px-4 py-4">
                              <p className="font-bold text-gray-800 line-clamp-1">{post.title}</p>
                              <p className="text-[10px] text-gray-400 font-semibold mt-0.5 flex items-center gap-1"><Link2 size={10} />{post.slug}</p>
                            </td>
                            <td className="px-4 py-4 text-xs font-bold text-gray-500">{post.category}</td>
                            <td className="px-4 py-4 text-xs font-semibold text-gray-600">{post.branch?.name || 'Global NGO'}</td>
                            <td className="px-4 py-4">
                              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                                post.status === 'Published' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                              }`}>{post.status}</span>
                            </td>
                            <td className="px-4 py-4 text-xs font-semibold text-gray-400">{new Date(post.createdAt).toLocaleDateString('en-IN')}</td>
                            <td className="px-4 py-4 text-right pr-6">
                              <div className="relative inline-block">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setOpenNewsMenu(openNewsMenu === post._id ? null : post._id); }}
                                  className="p-1.5 rounded border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer"
                                ><Settings size={14} className="text-gray-500" /></button>
                                {openNewsMenu === post._id && (
                                  <div className="absolute right-0 top-8 z-20 bg-white border border-gray-100 rounded-xl shadow-xl w-36 py-1" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={() => { setViewingNews(post); setOpenNewsMenu(null); }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer bg-transparent border-0">
                                      <Eye size={13} className="text-blue-500" /> View
                                    </button>
                                    <button onClick={() => { handleEditNewsClick(post); setOpenNewsMenu(null); }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer bg-transparent border-0">
                                      <Edit2 size={13} className="text-green-600" /> Edit
                                    </button>
                                    <button onClick={() => { handleDeleteNews(post._id); setOpenNewsMenu(null); }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 cursor-pointer bg-transparent border-0">
                                      <Trash2 size={13} /> Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center pt-4">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer bg-white"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-gray-400 font-bold">Page {page} of {totalPages}</span>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer bg-white"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Gallery Grid */}
            {activeTab === 'gallery' && (
              <div className="space-y-6" onClick={() => setOpenGalleryMenu(null)}>
                {galleryItems.length === 0 ? (
                  <div className="text-center py-20 text-gray-400 font-semibold">No gallery images uploaded yet.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {galleryItems.map((item) => (
                      <div key={item._id} className="relative bg-gray-50 border border-gray-100 rounded-2xl hover:shadow-md transition-shadow">
                        <img
                          src={item.imageUrlResolved || item.imageUrl}
                          alt={item.caption}
                          className="w-full h-40 object-cover rounded-t-2xl"
                        />
                        <div className="p-3.5 space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1 min-w-0">
                              <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-600 font-bold text-[9px] uppercase tracking-wider">
                                {item.category}
                              </span>
                              <p className="text-xs font-bold text-gray-800 line-clamp-1">{item.caption || 'No Caption'}</p>
                              <p className="text-[10px] text-gray-400 font-semibold">{item.branch?.name || 'Global HQ'}</p>
                            </div>
                            <div className="relative shrink-0">
                              <button
                                onClick={(e) => { e.stopPropagation(); setOpenGalleryMenu(openGalleryMenu === item._id ? null : item._id); }}
                                className="p-1.5 rounded border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer"
                              ><Settings size={13} className="text-gray-500" /></button>
                              {openGalleryMenu === item._id && (
                                <div className="absolute right-0 top-8 z-20 bg-white border border-gray-100 rounded-xl shadow-xl w-36 py-1" onClick={(e) => e.stopPropagation()}>
                                  <button onClick={() => { setViewingGallery(item); setOpenGalleryMenu(null); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer bg-transparent border-0">
                                    <Eye size={13} className="text-blue-500" /> View
                                  </button>
                                  <button onClick={() => { handleEditGalleryClick(item); setOpenGalleryMenu(null); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer bg-transparent border-0">
                                    <Edit2 size={13} className="text-green-600" /> Edit
                                  </button>
                                  <button onClick={() => { handleDeleteGalleryItem(item._id); setOpenGalleryMenu(null); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 cursor-pointer bg-transparent border-0">
                                    <Trash2 size={13} /> Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center pt-4">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer bg-white"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-gray-400 font-bold">Page {page} of {totalPages}</span>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer bg-white"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Testimonials */}
            {activeTab === 'testimonials' && (
              <div className="space-y-6" onClick={() => setOpenTestimonialMenu(null)}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-gray-500" style={{ borderColor: '#E0E0E0' }}>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-left w-10">Sr.</th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-left">Visitor</th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-left">Quote / Message</th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-left">Branch</th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-left">Approval</th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-right pr-6">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testimonials.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-10 text-gray-400 font-semibold">No testimonials found.</td>
                        </tr>
                      ) : (
                        testimonials.map((test, idx) => (
                          <tr key={test._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F0F0F0' }}>
                            <td className="px-4 py-4 text-xs font-bold text-gray-400">{(page - 1) * 10 + idx + 1}</td>
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
                            <td className="px-4 py-4 text-xs text-gray-600 max-w-sm italic line-clamp-2">
                              "{test.message}"
                            </td>
                            <td className="px-4 py-4 text-xs font-semibold text-gray-600">{test.branch?.name || 'Global HQ'}</td>
                            <td className="px-4 py-4">
                              <button
                                onClick={() => handleToggleApproveTestimonial(test._id, test.isApproved)}
                                className={`px-2.5 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer bg-white ${
                                  test.isApproved
                                    ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                    : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
                                }`}
                              >
                                {test.isApproved ? 'Approved (Active)' : 'Pending (Disabled)'}
                              </button>
                            </td>
                            <td className="px-4 py-4 text-right pr-6">
                              <div className="relative inline-block">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setOpenTestimonialMenu(openTestimonialMenu === test._id ? null : test._id); }}
                                  className="p-1.5 rounded border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer"
                                ><Settings size={14} className="text-gray-500" /></button>
                                {openTestimonialMenu === test._id && (
                                  <div className="absolute right-0 top-8 z-20 bg-white border border-gray-100 rounded-xl shadow-xl w-36 py-1" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={() => { setViewingTestimonial(test); setOpenTestimonialMenu(null); }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer bg-transparent border-0">
                                      <Eye size={13} className="text-blue-500" /> View
                                    </button>
                                    <button onClick={() => { handleDeleteTestimonial(test._id); setOpenTestimonialMenu(null); }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 cursor-pointer bg-transparent border-0">
                                      <Trash2 size={13} /> Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center pt-4">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer bg-white"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-gray-400 font-bold">Page {page} of {totalPages}</span>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer bg-white"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Contact Queries */}
            {activeTab === 'queries' && (
              <div className="space-y-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-gray-500" style={{ borderColor: '#E0E0E0' }}>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-left">Sender</th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-left">Subject</th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-left">Branch Scope</th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-left">Status</th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-left">Received Date</th>
                        <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-right pr-6">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {queries.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-10 text-gray-400 font-semibold">No inquiries in the mailbox.</td>
                        </tr>
                      ) : (
                        queries.map((q) => (
                          <tr key={q._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F0F0F0' }}>
                            <td className="px-4 py-4">
                              <div>
                                <p className="font-bold text-gray-800">{q.name}</p>
                                <p className="text-[10px] text-gray-400 font-bold">{q.email}</p>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-xs font-bold text-gray-600 line-clamp-1">{q.subject}</td>
                            <td className="px-4 py-4 text-xs font-semibold text-gray-500">{q.branch?.name || 'Global HQ'}</td>
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
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setSelectedQuery(q)}
                                  className="p-1.5 rounded hover:bg-green-50 text-green-700 border border-green-200 bg-white cursor-pointer"
                                  title="View Message"
                                >
                                  <Eye size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteQuery(q._id)}
                                  className="p-1.5 rounded hover:bg-red-50 text-red-500 border border-red-200 bg-white cursor-pointer"
                                  title="Delete Query"
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center pt-4">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer bg-white"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-gray-400 font-bold">Page {page} of {totalPages}</span>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer bg-white"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </div>

      {/* MODALS */}

      {/* 0. Homepage Config Modal */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 overflow-y-auto no-scrollbar">
          <div className="w-full max-w-2xl bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-extrabold text-gray-800">Edit Homepage Config</h3>
                <p className="text-xs text-gray-400 mt-0.5 font-bold">Update hero banner, mission, vision and stats</p>
              </div>
              <button onClick={() => setIsConfigModalOpen(false)} className="p-1 rounded hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={async (e) => { await handleConfigSubmit(e); setIsConfigModalOpen(false); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Hero Title</label>
                  <input type="text" value={configForm.heroTitle}
                    onChange={(e) => setConfigForm(p => ({ ...p, heroTitle: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
                    placeholder="e.g. SAVITRAM FOUNDATION" />
                </div>
                <ImageUploader
                  value={configForm.heroImagePreview || configForm.heroImage}
                  onChange={(key, previewUrl) => setConfigForm(p => ({ ...p, heroImage: key, heroImagePreview: previewUrl }))}
                  token={token} fileType="hero" label="Hero Banner Image"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Hero Subtitle</label>
                <textarea value={configForm.heroSubtitle}
                  onChange={(e) => setConfigForm(p => ({ ...p, heroSubtitle: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50 h-16 resize-none"
                  placeholder="Short tagline" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Mission</label>
                  <textarea value={configForm.mission}
                    onChange={(e) => setConfigForm(p => ({ ...p, mission: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50 h-20 resize-none"
                    placeholder="Mission statement" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Vision</label>
                  <textarea value={configForm.vision}
                    onChange={(e) => setConfigForm(p => ({ ...p, vision: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50 h-20 resize-none"
                    placeholder="Vision statement" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[['Lives Impacted', 'livesImpacted'], ['Active Volunteers', 'volunteersCount'], ['Completed Projects', 'projectsCompleted']].map(([label, key]) => (
                  <div key={key}>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</label>
                    <input type="number" value={configForm.stats[key]}
                      onChange={(e) => setConfigForm(p => ({ ...p, stats: { ...p.stats, [key]: parseInt(e.target.value) || 0 } }))}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50" />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsConfigModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 cursor-pointer bg-white">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-3 border-0 rounded-xl text-sm font-bold text-white cursor-pointer bg-[#1B5E20] hover:opacity-90 flex items-center justify-center gap-2">
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. News Edit/Create Modal */}
      {isNewsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 overflow-y-auto no-scrollbar">
          <div className="w-full max-w-2xl bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-extrabold text-gray-800">{editingNews ? 'Edit News Article' : 'Write News Article'}</h3>
                <p className="text-xs text-gray-400 mt-0.5 font-bold">Share NGO achievements, campaigns, or social drive blogs</p>
              </div>
              <button onClick={() => setIsNewsModalOpen(false)} className="p-1 rounded hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleNewsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Article Title *</label>
                <input
                  type="text" required placeholder="e.g. Health Checkup Drive in Lucknow"
                  value={newsForm.title}
                  onChange={(e) => setNewsForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Category</label>
                  <input
                    type="text" placeholder="e.g. Health, Education, Environment"
                    value={newsForm.category}
                    onChange={(e) => setNewsForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Branch Scope</label>
                  <select
                    value={newsForm.branch}
                    onChange={(e) => setNewsForm(p => ({ ...p, branch: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer"
                  >
                    <option value="">Global / Head Office</option>
                    {branches.map(b => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
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

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Content Editor *</label>
                <textarea
                  required placeholder="Write detailed content here..."
                  value={newsForm.content}
                  onChange={(e) => setNewsForm(p => ({ ...p, content: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50 h-40"
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
                  {editingNews ? 'Update Post' : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1.5 News View Modal */}
      {viewingNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 overflow-y-auto no-scrollbar">
          <div className="w-full max-w-2xl bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-extrabold text-gray-800">Article Details</h3>
                <p className="text-xs text-gray-400 mt-0.5 font-bold">Full preview of the news article</p>
              </div>
              <button onClick={() => setViewingNews(null)} className="p-1 rounded hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              {(viewingNews.coverImageUrl || viewingNews.coverImage) && (
                <img src={viewingNews.coverImageUrl || viewingNews.coverImage} alt="cover" className="w-full h-48 object-cover rounded-2xl border border-gray-100" />
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold border bg-blue-50 text-blue-700 border-blue-200">{viewingNews.category}</span>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                  viewingNews.status === 'Published' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                }`}>{viewingNews.status}</span>
                <span className="text-[10px] text-gray-400 font-semibold">{viewingNews.branch?.name || 'Global NGO'}</span>
                <span className="text-[10px] text-gray-400 font-semibold ml-auto">{new Date(viewingNews.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span>
              </div>
              <div>
                <h4 className="text-base font-extrabold text-gray-800">{viewingNews.title}</h4>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">/{viewingNews.slug}</p>
              </div>
              <p className="text-xs text-gray-700 font-semibold leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-xl border border-gray-100">{viewingNews.content}</p>
              <div className="flex justify-between pt-3 border-t border-gray-100">
                <button onClick={() => { handleEditNewsClick(viewingNews); setViewingNews(null); }}
                  className="px-4 py-2.5 bg-[#1B5E20] text-white rounded-xl text-xs font-bold cursor-pointer border-0 flex items-center gap-1 hover:opacity-90">
                  <Edit2 size={12} /> Edit Article
                </button>
                <button onClick={() => setViewingNews(null)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 cursor-pointer bg-white">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Gallery View Modal */}
      {viewingGallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 overflow-y-auto no-scrollbar">
          <div className="w-full max-w-lg bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-extrabold text-gray-800">Gallery Photo Details</h3>
                <p className="text-xs text-gray-400 mt-0.5 font-bold">Full preview of the gallery image</p>
              </div>
              <button onClick={() => setViewingGallery(null)} className="p-1 rounded hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <img src={viewingGallery.imageUrlResolved || viewingGallery.imageUrl} alt={viewingGallery.caption} className="w-full h-56 object-cover rounded-2xl border border-gray-100" />
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded bg-gray-200 text-gray-600 font-bold text-[10px] uppercase tracking-wider">{viewingGallery.category}</span>
                <span className="text-[10px] text-gray-400 font-semibold">{viewingGallery.branch?.name || 'Global HQ'}</span>
                <span className="text-[10px] text-gray-400 font-semibold ml-auto">{new Date(viewingGallery.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span>
              </div>
              <p className="text-sm font-bold text-gray-800">{viewingGallery.caption || 'No Caption'}</p>
              <div className="flex justify-between pt-3 border-t border-gray-100">
                <button onClick={() => { handleEditGalleryClick(viewingGallery); setViewingGallery(null); }}
                  className="px-4 py-2.5 bg-[#1B5E20] text-white rounded-xl text-xs font-bold cursor-pointer border-0 flex items-center gap-1 hover:opacity-90">
                  <Edit2 size={12} /> Edit Photo
                </button>
                <button onClick={() => setViewingGallery(null)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 cursor-pointer bg-white">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2.5 Gallery Edit Modal */}
      {editingGallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 overflow-y-auto no-scrollbar">
          <div className="w-full max-w-xl bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-extrabold text-gray-800">Edit Gallery Photo</h3>
                <p className="text-xs text-gray-400 mt-0.5 font-bold">Update caption, category or replace image</p>
              </div>
              <button onClick={() => setEditingGallery(null)} className="p-1 rounded hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleGalleryEditSubmit} className="space-y-4">
              <ImageUploader
                value={galleryEditForm.imageUrl}
                previewUrl={galleryEditForm.imageUrlPreview}
                onChange={(key, previewUrl) => setGalleryEditForm(p => ({ ...p, imageUrl: key, imageUrlPreview: previewUrl }))}
                token={token} fileType="gallery" label="Gallery Image"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Category Tag</label>
                  <select value={galleryEditForm.category}
                    onChange={(e) => setGalleryEditForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer">
                    <option value="General">General</option>
                    <option value="Drives">Donation Drives</option>
                    <option value="Campaigns">Campaigns</option>
                    <option value="Events">Events</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Branch Pool</label>
                  <select value={galleryEditForm.branch}
                    onChange={(e) => setGalleryEditForm(p => ({ ...p, branch: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer">
                    <option value="">Global / Head Office</option>
                    {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Caption / Description</label>
                <input type="text" placeholder="Short description of the photo"
                  value={galleryEditForm.caption}
                  onChange={(e) => setGalleryEditForm(p => ({ ...p, caption: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50" />
              </div>
              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setEditingGallery(null)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 cursor-pointer bg-white">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-3 border-0 rounded-xl text-sm font-bold text-white cursor-pointer bg-[#1B5E20] hover:opacity-90 flex items-center justify-center gap-2">
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  Save Changes
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
                <h3 className="text-lg font-extrabold text-gray-800">Add Photo to Gallery</h3>
                <p className="text-xs text-gray-400 mt-0.5 font-bold">Showcase social impact photos in the public photo grid</p>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Category Tag</label>
                  <select
                    value={galleryForm.category}
                    onChange={(e) => setGalleryForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer"
                  >
                    <option value="General">General</option>
                    <option value="Drives">Donation Drives</option>
                    <option value="Campaigns">Campaigns</option>
                    <option value="Events">Events</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Branch Pool</label>
                  <select
                    value={galleryForm.branch}
                    onChange={(e) => setGalleryForm(p => ({ ...p, branch: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer"
                  >
                    <option value="">Global / Head Office</option>
                    {branches.map(b => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

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

      {/* 3.5 Testimonial View Modal */}
      {viewingTestimonial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 overflow-y-auto no-scrollbar">
          <div className="w-full max-w-lg bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-extrabold text-gray-800">Testimonial Details</h3>
                <p className="text-xs text-gray-400 mt-0.5 font-bold">Full preview of the testimonial entry</p>
              </div>
              <button onClick={() => setViewingTestimonial(null)} className="p-1 rounded hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={viewingTestimonial.avatarUrlResolved || viewingTestimonial.avatar || 'https://placehold.co/80x80/f3f4f6/9ca3af?text=Pic'}
                  alt="avatar"
                  className="w-16 h-16 object-cover rounded-full border-2 border-gray-200"
                />
                <div>
                  <p className="font-extrabold text-gray-800 text-base">{viewingTestimonial.name}</p>
                  <p className="text-xs text-gray-400 font-bold mt-0.5">{viewingTestimonial.role}</p>
                  <p className="text-xs text-gray-500 font-semibold mt-0.5">{viewingTestimonial.branch?.name || 'Global HQ'}</p>
                </div>
                <span className={`ml-auto px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                  viewingTestimonial.isApproved ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                }`}>{viewingTestimonial.isApproved ? 'Approved' : 'Pending'}</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-700 font-semibold leading-relaxed italic">"{viewingTestimonial.message}"</p>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-100">
                <button onClick={() => { handleToggleApproveTestimonial(viewingTestimonial._id, viewingTestimonial.isApproved); setViewingTestimonial(null); }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer border-0 flex items-center gap-1 hover:opacity-90 ${
                    viewingTestimonial.isApproved ? 'bg-orange-500 text-white' : 'bg-[#1B5E20] text-white'
                  }`}>
                  {viewingTestimonial.isApproved ? 'Set Pending' : 'Approve'}
                </button>
                <button onClick={() => setViewingTestimonial(null)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 cursor-pointer bg-white">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Add Testimonial Modal */}
      {isTestimonialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 overflow-y-auto no-scrollbar">
          <div className="w-full max-w-xl bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-extrabold text-gray-800">Add Testimonial Entry</h3>
                <p className="text-xs text-gray-400 mt-0.5 font-bold">Publish feedback quotes from volunteers, partners, or sponsors</p>
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
                    type="text" required placeholder="e.g. Ramesh Kumar"
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
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Branch Scope</label>
                  <select
                    value={testimonialForm.branch}
                    onChange={(e) => setTestimonialForm(p => ({ ...p, branch: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-transparent cursor-pointer"
                  >
                    <option value="">Global / Head Office</option>
                    {branches.map(b => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Quote message *</label>
                <textarea
                  required placeholder="What feedback did they share about our NGO?"
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
                  Save Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Contact Query Details Dialog Modal */}
      {selectedQuery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 overflow-y-auto no-scrollbar">
          <div className="w-full max-w-xl bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-extrabold text-gray-800">Visitor Message Details</h3>
                <p className="text-xs text-gray-400 mt-0.5 font-bold">Read inbox request submitted by anonymous visitor</p>
              </div>
              <button onClick={() => setSelectedQuery(null)} className="p-1 rounded hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sender Name</span>
                  <span className="font-bold text-gray-800">{selectedQuery.name}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</span>
                  <span className="font-semibold text-gray-700">{selectedQuery.email}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contact Phone</span>
                  <span className="font-semibold text-gray-700">{selectedQuery.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Received Date</span>
                  <span className="font-semibold text-gray-700">
                    {new Date(selectedQuery.createdAt).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}
                  </span>
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Subject</span>
                <span className="font-bold text-gray-800">{selectedQuery.subject}</span>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Message Content</span>
                <p className="text-xs text-gray-700 bg-gray-50/50 p-3 rounded-xl border border-gray-100 leading-relaxed font-semibold">
                  "{selectedQuery.message}"
                </p>
              </div>

              {/* Remarks/Response notes */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Response Action Notes / Comments</label>
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
                  placeholder="Record call logs, reply status, or email responses..."
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 focus:border-green-500 bg-gray-50/50 h-20 resize-none font-semibold text-gray-700"
                />
              </div>

              {/* Status toggles */}
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-400 uppercase">Change Status:</span>
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

              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button" onClick={() => handleDeleteQuery(selectedQuery._id)}
                  className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold cursor-pointer hover:bg-red-100 flex items-center gap-1"
                >
                  <Trash2 size={12} /> Delete Message
                </button>
                <div className="flex-1"></div>
                <button
                  type="button" onClick={() => setSelectedQuery(null)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 cursor-pointer bg-white"
                >
                  Close Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
};

export default WebsiteCMS;
