import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Image, Film, FileText, Music, HelpCircle, Search, Upload, Trash2, Copy, Eye,
  Loader2, ExternalLink, X
} from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../../shared/AuthContext';
import { useToast } from '../../../shared/ToastContext';
import API_BASE_URL from '../../../shared/apiConfig';

const MEDIA_API = `${API_BASE_URL}/api/admin/media`;

const AdminMediaLibrary = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef();

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [assets, setAssets] = useState([]);

  // Filter state
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals / Preview
  const [previewAsset, setPreviewAsset] = useState(null);

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
        toast.error(`Error: ${res.statusText}`);
        return null;
      }
      return await res.json();
    } catch (err) {
      console.error('Branch Media API error:', err);
      return null;
    }
  }, [token, toast]);

  const loadAssets = useCallback(async () => {
    setLoading(true);
    try {
      const url = `${MEDIA_API}?page=${page}&limit=12&category=${category}&search=${encodeURIComponent(search)}`;
      const json = await fetchAPI(url);
      if (json && json.success) {
        setAssets(json.data || []);
        setTotalPages(json.pagination.totalPages || 1);
      }
    } catch (err) {
      toast.error('Failed to load branch assets');
    } finally {
      setLoading(false);
    }
  }, [page, category, search, fetchAPI, toast]);

  useEffect(() => {
    setPage(1);
  }, [category, search]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const getCategoryFromMimetype = (mime) => {
    if (mime.startsWith('image/')) return 'image';
    if (mime.startsWith('video/')) return 'video';
    if (mime.startsWith('audio/')) return 'audio';
    if (mime.includes('pdf') || mime.includes('word') || mime.includes('document') || mime.includes('sheet') || mime.includes('text')) return 'document';
    return 'other';
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'image': return <Image className="text-blue-500" size={24} />;
      case 'video': return <Film className="text-purple-500" size={24} />;
      case 'document': return <FileText className="text-amber-500" size={24} />;
      case 'audio': return <Music className="text-emerald-500" size={24} />;
      default: return <HelpCircle className="text-gray-400" size={24} />;
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileCat = getCategoryFromMimetype(file.type);
      
      // 1. Get presigned upload URL
      const url = `${MEDIA_API}/upload-url?fileName=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}&category=${fileCat}`;
      const resUrl = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const jsonUrl = await resUrl.json();
      
      if (!jsonUrl.success) {
        throw new Error(jsonUrl.message || 'Failed to get upload link');
      }

      // 2. Put file to Cloudflare R2
      const putRes = await fetch(jsonUrl.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });

      if (!putRes.ok) {
        throw new Error('Storage transmission failed');
      }

      // 3. Save asset record to MongoDB
      const saveRes = await fetchAPI(MEDIA_API, {
        method: 'POST',
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          key: jsonUrl.key,
          category: fileCat
        })
      });

      if (saveRes && saveRes.success) {
        toast.success('Asset uploaded and cataloged under branch');
        loadAssets();
      } else {
        toast.error('Failed to log asset metadata');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopyLink = (resolvedUrl) => {
    navigator.clipboard.writeText(resolvedUrl);
    toast.success('Direct link copied to clipboard!');
  };

  const handleDeleteAsset = async (id) => {
    if (!window.confirm('Delete this media asset permanently?')) return;
    const json = await fetchAPI(`${MEDIA_API}/${id}`, { method: 'DELETE' });
    if (json && json.success) {
      toast.success('Asset deleted successfully');
      loadAssets();
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Layout>
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <Image className="text-[#1B5E20]" size={28} />
              Branch Media Library
            </h1>
            <p className="text-xs text-gray-400 font-bold mt-1">
              Store and manage digital assets scoped to this branch drive
            </p>
          </div>
          <div>
            <button
              onClick={() => fileInputRef.current.click()}
              disabled={uploading}
              className="px-5 py-3 border-0 rounded-2xl bg-[#1B5E20] hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-opacity shadow-sm"
            >
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {uploading ? 'Uploading to Bucket...' : 'Upload New File'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white border border-gray-100 p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4 shadow-sm">
          {/* Search */}
          <div className="flex-1 w-full flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl bg-gray-50/50">
            <Search className="text-gray-400 shrink-0" size={16} />
            <input
              type="text"
              placeholder="Search by file name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-0 outline-none text-xs w-full font-semibold text-gray-700"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto gap-1">
            {[
              { id: '', label: 'All' },
              { id: 'image', label: 'Images' },
              { id: 'document', label: 'Docs' },
              { id: 'audio', label: 'Audio' },
              { id: 'video', label: 'Videos' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border-0 cursor-pointer transition-colors ${
                  category === cat.id ? 'bg-white text-gray-800 shadow-sm' : 'bg-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Assets Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="animate-spin text-[#1B5E20]" size={40} />
            <p className="text-xs text-gray-400 font-bold">Querying branch storage...</p>
          </div>
        ) : assets.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl py-20 text-center text-gray-400 font-semibold shadow-sm">
            No assets found in branch storage bucket.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {assets.map(asset => (
              <div
                key={asset._id}
                className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative group flex flex-col justify-between"
              >
                {/* Visual Thumbnail */}
                <div className="h-48 w-full bg-gray-50 flex items-center justify-center relative border-b border-gray-50 overflow-hidden">
                  {asset.category === 'image' && asset.urlResolved ? (
                    <img
                      src={asset.urlResolved}
                      alt={asset.fileName}
                      className="w-full h-full object-cover"
                    />
                  ) : asset.category === 'video' && asset.urlResolved ? (
                    <video
                      src={asset.urlResolved}
                      className="w-full h-full object-cover"
                      preload="metadata"
                      muted
                      playsInline
                    />
                  ) : (
                    <div className="p-6 bg-gray-100 rounded-2xl">
                      {getCategoryIcon(asset.category)}
                    </div>
                  )}

                  {/* Actions overlay on Hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => setPreviewAsset(asset)}
                      className="p-2 bg-white rounded-xl text-gray-800 hover:bg-green-50 transition-colors border-0 cursor-pointer shadow-sm"
                      title="Preview File"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleCopyLink(asset.urlResolved)}
                      className="p-2 bg-white rounded-xl text-gray-800 hover:bg-green-50 transition-colors border-0 cursor-pointer shadow-sm"
                      title="Copy View URL"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteAsset(asset._id)}
                      className="p-2 bg-red-650 rounded-xl text-white hover:bg-red-700 transition-colors border-0 cursor-pointer shadow-sm"
                      title="Delete Asset"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Details Footer */}
                <div className="p-4 space-y-1 text-left">
                  <h4 className="font-bold text-gray-800 text-xs truncate" title={asset.fileName}>
                    {asset.fileName}
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">{asset.category}</span>
                    <span className="text-[10px] text-gray-400 font-mono font-semibold">{formatBytes(asset.fileSize)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
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

      {/* PREVIEW MODAL */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 overflow-y-auto no-scrollbar">
          <div className="w-full max-w-3xl bg-white border border-gray-100 shadow-2xl relative rounded-3xl p-6 md:p-8 space-y-5 max-h-[95vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="text-left">
                <h3 className="text-sm font-extrabold text-gray-800 truncate max-w-md">{previewAsset.fileName}</h3>
                <p className="text-[10px] text-gray-400 mt-0.5 font-bold font-mono">Size: {formatBytes(previewAsset.fileSize)} | MIME: {previewAsset.mimeType}</p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={previewAsset.urlResolved}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded hover:bg-gray-100 cursor-pointer border border-gray-200 bg-white flex items-center gap-1 text-[11px] font-bold text-gray-600 no-underline"
                >
                  Open Link
                </a>
                <button onClick={() => setPreviewAsset(null)} className="p-1 rounded hover:bg-gray-100 cursor-pointer border-0 bg-transparent">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Display according to type */}
            <div className="flex justify-center bg-gray-50 p-4 rounded-2xl border border-gray-100 min-h-[30vh]">
              {previewAsset.category === 'image' && (
                <img
                  src={previewAsset.urlResolved}
                  alt={previewAsset.fileName}
                  className="max-h-[60vh] max-w-full object-contain rounded-xl"
                />
              )}
               {(previewAsset.mimeType === 'application/pdf' || previewAsset.fileName.toLowerCase().endsWith('.pdf')) && (
                <object
                  data={previewAsset.urlResolved}
                  type="application/pdf"
                  className="w-full h-[60vh] rounded-xl border-0"
                >
                  <div className="flex flex-col items-center justify-center p-10 text-center w-full space-y-4 bg-white rounded-2xl border border-gray-150 shadow-sm">
                    <FileText className="text-amber-500" size={50} />
                    <p className="text-xs text-gray-500 font-bold">
                      Your browser does not support inline PDF viewing.
                    </p>
                    <a
                      href={previewAsset.urlResolved}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 bg-[#1B5E20] hover:opacity-90 text-white rounded-xl text-xs font-bold no-underline inline-block cursor-pointer"
                    >
                      Download & Open PDF Document
                    </a>
                  </div>
                </object>
              )}
              {previewAsset.category === 'audio' && (
                <div className="flex flex-col items-center justify-center py-10 w-full space-y-4">
                  <Music className="text-green-600" size={60} />
                  <audio src={previewAsset.urlResolved} controls className="w-full max-w-md" />
                </div>
              )}
              {previewAsset.category === 'video' && (
                <video src={previewAsset.urlResolved} controls className="max-h-[60vh] w-full rounded-xl bg-black" />
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setPreviewAsset(null)}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 cursor-pointer bg-white"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminMediaLibrary;
