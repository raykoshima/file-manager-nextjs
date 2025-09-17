'use client';

import { useState, useEffect } from 'react';
import FileUpload from './FileUpload';
import FileList from './FileList';

interface FileManagerProps {
  user: any;
}

export default function FileManager({ user }: FileManagerProps) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const endpoint = user ? '/api/files' : '/api/public/files';
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files);
      }
    } catch (error) {
      console.error('Failed to fetch files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [user]);

  const handleFileUploaded = () => {
    fetchFiles();
  };

  const handleFileDeleted = () => {
    fetchFiles();
  };

  return (
    <div className="space-y-6">
      {user ? (
        <>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Files</h2>
            <FileUpload onUploaded={handleFileUploaded} />
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Your Files</h2>
            <FileList 
              files={files} 
              loading={loading} 
              onFileDeleted={handleFileDeleted}
              isOwner={true}
            />
          </div>
        </>
      ) : (
        <>
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="max-w-md mx-auto">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Authentication Required for Upload</h3>
              <p className="mt-1 text-sm text-gray-500">
                Please login or register to upload and manage files.
              </p>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Public Files</h2>
            <FileList 
              files={files} 
              loading={loading} 
              onFileDeleted={handleFileDeleted}
              isOwner={false}
            />
          </div>
        </>
      )}
    </div>
  );
}
