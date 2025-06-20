import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './FileUpload.css';
import { uploadApi } from '../services/api';

const FileUpload = ({ onFileUpload, existingFile }) => {
  const [file, setFile] = useState(existingFile);
  const [uploading, setUploading] = useState(false);
  const [fileDetails, setFileDetails] = useState(null);

  // Function to get full URL of a file
  const getFullFileUrl = (fileUrl) => {
    // If fileUrl is empty, return empty string
    if (!fileUrl) return '';
    
    // If fileUrl is already a full URL (starts with http), return it as is
    if (fileUrl.startsWith('http')) return fileUrl;
    
    // Ensure URL starts with a slash
    if (!fileUrl.startsWith('/')) {
      fileUrl = `/${fileUrl}`;
    }
    
    // Return the URL as is (relative URLs work better for same-origin resources)
    return fileUrl;
  };

  // Extract filename for display
  const getDisplayName = (fileUrl) => {
    // If we have stored file details with original name, use that
    if (fileDetails && fileDetails.originalName) {
      return fileDetails.originalName;
    }
    
    // Otherwise, extract from URL
    return fileUrl ? fileUrl.split('/').pop() : 'File';
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const selectedFile = acceptedFiles[0];
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await uploadApi.uploadFile(formData);
      const data = response.data;
      
      setFile(data.fileUrl);
      setFileDetails({
        originalName: data.originalName || selectedFile.name,
        storedName: data.storedName,
        fileSize: data.fileSize || selectedFile.size
      });
      
      if (onFileUpload) {
        onFileUpload(data.fileUrl, {
          originalName: data.originalName || selectedFile.name,
          storedName: data.storedName,
          fileSize: data.fileSize || selectedFile.size
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        alert('Failed to upload file');
      }
    } finally {
      setUploading(false);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  return (
    <div className="file-upload">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="upload-status">Uploading...</div>
        ) : file ? (
          <div className="file-preview">
            {file.endsWith('.pdf') ? (
              <div className="pdf-preview">
                <i className="fas fa-file-pdf"></i>
                <span>{getDisplayName(file)}</span>
                <a href={getFullFileUrl(file)} target="_blank" rel="noopener noreferrer" className="view-file" download={getDisplayName(file)}>
                  View PDF
                </a>
              </div>
            ) : file.match(/\.(jpg|jpeg|png|gif)$/) ? (
              <div className="image-preview">
                <img src={getFullFileUrl(file)} alt="Preview" />
                <span>{getDisplayName(file)}</span>
                <a href={getFullFileUrl(file)} target="_blank" rel="noopener noreferrer" className="view-file" download={getDisplayName(file)}>
                  View Image
                </a>
              </div>
            ) : (
              <div className="file-icon">
                <i className="fas fa-file"></i>
                <span>{getDisplayName(file)}</span>
                <a href={getFullFileUrl(file)} target="_blank" rel="noopener noreferrer" className="view-file" download={getDisplayName(file)}>
                  Download File
                </a>
              </div>
            )}
            <button
              className="remove-file"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                setFileDetails(null);
                if (onFileUpload) onFileUpload(null);
              }}
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="upload-prompt">
            <i className="fas fa-cloud-upload-alt"></i>
            <p>Drag & drop a file here, or click to select</p>
            <p className="file-types">Supported: PDF, Images, Word</p>
            <p className="file-size">Max size: 5MB</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload; 