import React, { useState, useRef } from 'react';
import { uploadService } from '../../api/uploadService';
import { api } from '../../api/api';
import { X, UploadCloud, Loader2 } from 'lucide-react';

export default function ImageUploader({ 
  onUpload, 
  onRemove, 
  currentImageUrls = [], 
  maxFiles = 5,
  deleteEndpoint,
  referenceId
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState({}); // { [fileName]: boolean }
  const [deletingFiles, setDeletingFiles] = useState({}); // { [url]: boolean }
  const [newlyUploadedUrls, setNewlyUploadedUrls] = useState([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files) => {
    setError('');
    
    const remainingSlots = maxFiles - currentImageUrls.length;
    const filesToUpload = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      setError(`You can only upload up to ${maxFiles} images. Some files were skipped.`);
    }

    const validFiles = filesToUpload.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      
      if (!isValidType) setError(prev => `${prev ? prev + '\n' : ''}${file.name} has an invalid type.`);
      if (!isValidSize) setError(prev => `${prev ? prev + '\n' : ''}${file.name} is larger than 5MB.`);
      
      return isValidType && isValidSize;
    });

    const uploadPromises = validFiles.map(async (file) => {
      setUploadingFiles(prev => ({ ...prev, [file.name]: true }));
      try {
        const url = await uploadService.uploadFile(file);
        return url;
      } catch (err) {
        setError(prev => `${prev ? prev + '\n' : ''}Failed to upload ${file.name}: ${err.message}`);
        return null;
      } finally {
        setUploadingFiles(prev => {
          const newState = { ...prev };
          delete newState[file.name];
          return newState;
        });
      }
    });

    const newUrls = (await Promise.all(uploadPromises)).filter(Boolean);
    if (newUrls.length > 0) {
      setNewlyUploadedUrls(prev => [...prev, ...newUrls]);
      onUpload([...currentImageUrls, ...newUrls]);
    }
    
    // Reset input so the same file can be selected again if needed
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleRemove = async (url) => {
    // If it's a newly uploaded image, just remove from local state
    if (!deleteEndpoint || !referenceId || newlyUploadedUrls.includes(url)) {
      onRemove(url);
      setNewlyUploadedUrls(prev => prev.filter(u => u !== url));
      return;
    }

    // Otherwise, call API to delete existing image
    setError('');
    setDeletingFiles(prev => ({ ...prev, [url]: true }));

    try {
      const response = await api.delete(`/${deleteEndpoint}/${referenceId}/images`, {
        data: { imageUrl: url }
      });
      if (response.data.success) {
        onRemove(url);
      } else {
        setError(response.data.message || 'Failed to delete image');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete image');
    } finally {
      setDeletingFiles(prev => {
        const newState = { ...prev };
        delete newState[url];
        return newState;
      });
    }
  };

  return (
    <div className="w-full space-y-4 font-body">
      {error && (
        <div className="rounded bg-ruin-magenta/10 p-3 text-sm text-ruin-magenta whitespace-pre-line">
          {error}
        </div>
      )}

      {currentImageUrls.length < maxFiles && (
        <div
          className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors ${
            isDragging
              ? 'border-ruin-orange bg-ruin-orange/5'
              : 'border-ruin-border bg-ruin-background hover:border-ruin-orange/50 hover:bg-ruin-card'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/jpeg, image/png, image/webp, image/gif"
            multiple
            onChange={handleFileChange}
          />
          <UploadCloud className="mb-2 h-8 w-8 text-ruin-muted" />
          <p className="text-sm font-medium text-ruin-text">
            Click or drag images here
          </p>
          <p className="mt-1 text-xs text-ruin-muted">
            PNG, JPG, WEBP, GIF up to 5MB
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
         <span className="text-xs font-medium text-ruin-muted">
            {currentImageUrls.length} / {maxFiles} images uploaded
         </span>
         {Object.keys(uploadingFiles).length > 0 && (
             <span className="text-xs text-ruin-orange flex items-center gap-1">
                 <Loader2 className="h-3 w-3 animate-spin" /> Uploading {Object.keys(uploadingFiles).length} file(s)...
             </span>
         )}
      </div>

      {currentImageUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {currentImageUrls.map((url, index) => (
            <div key={url} className="group relative aspect-square rounded-lg border border-ruin-border bg-black overflow-hidden">
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="h-full w-full object-cover transition-opacity group-hover:opacity-80"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(url);
                }}
                disabled={deletingFiles[url]}
                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-sm transition-all hover:bg-ruin-magenta group-hover:opacity-100 disabled:opacity-100 disabled:cursor-not-allowed"
                aria-label="Remove image"
              >
                {deletingFiles[url] ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-4 w-4" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
