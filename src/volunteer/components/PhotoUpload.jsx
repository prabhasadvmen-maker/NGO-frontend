import React, { useState } from 'react';
import { Upload, Camera, Trash2, Loader, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../shared/apiConfig';

export default function PhotoUpload({ photos = [], onChange, label = 'Upload Proof Photos', maxPhotos = 5 }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (photos.length + files.length > maxPhotos) {
      setError(`You can upload a maximum of ${maxPhotos} photos.`);
      return;
    }

    setUploading(true);
    setError('');

    try {
      const newPhotos = [];

      for (const file of files) {
        // Create instant crisp Object URL for local preview
        const blobPreview = URL.createObjectURL(file);
        let photoKey = blobPreview;

        try {
          // Attempt R2 Presigned URL upload
          const res = await axios.get(`${API_BASE_URL}/api/public/food-donations/upload-url`, {
            params: { fileName: file.name, fileType: file.type },
          });

          if (res.data?.success) {
            const { uploadUrl, key } = res.data.data;
            await axios.put(uploadUrl, file, {
              headers: { 'Content-Type': file.type },
            });
            photoKey = key;
          }
        } catch (r2Err) {
          console.warn('R2 Direct upload skipped, using local blob fallback:', r2Err);
        }

        newPhotos.push({ key: photoKey, preview: blobPreview });
      }

      onChange([...photos, ...newPhotos]);
    } catch (err) {
      console.error('Error handling photos:', err);
      setError('Failed to process photo. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removePhoto = (index) => {
    const updated = photos.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3 font-sans">
      <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
        {label} ({photos.length}/{maxPhotos})
      </label>

      {/* Upload Zone */}
      {photos.length < maxPhotos && (
        <div>
          <input
            type="file"
            multiple
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id="volunteer-photo-input"
          />

          <label
            htmlFor="volunteer-photo-input"
            className="block border-2 border-dashed border-[#1B5E20]/40 bg-emerald-50/40 hover:bg-emerald-50/80 rounded-2xl p-6 text-center cursor-pointer transition-all shadow-xs group hover:border-[#1B5E20]"
          >
            {uploading ? (
              <div className="flex flex-col items-center justify-center gap-2 py-2">
                <Loader size={28} className="animate-spin text-[#1B5E20]" />
                <span className="text-xs font-black text-[#1B5E20]">Processing & Uploading Photos...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#1B5E20] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <Camera size={24} />
                </div>
                <p className="text-sm font-extrabold text-[#1B5E20]">Take Photo or Click to Upload</p>
                <p className="text-[11px] font-bold text-slate-500">Supports Camera & Device Storage (JPG, PNG)</p>
              </div>
            )}
          </label>
        </div>
      )}

      {error && <p className="text-xs font-bold text-red-600">{error}</p>}

      {/* Thumbnail Previews */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
          {photos.map((item, idx) => {
            const imgSrc = typeof item === 'string' ? item : (item.preview || item.key);
            return (
              <div key={idx} className="relative group bg-slate-900 rounded-2xl overflow-hidden border-2 border-[#1B5E20] shadow-sm">
                <div className="w-full h-28 bg-slate-900 flex items-center justify-center overflow-hidden">
                  <img
                    src={imgSrc}
                    alt={`Proof photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-slate-950/90 backdrop-blur-xs px-2.5 py-1 flex items-center justify-between text-[10px] font-extrabold text-white">
                  <span>Photo #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="p-1 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
                    title="Remove Photo"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
