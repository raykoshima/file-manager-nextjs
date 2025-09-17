'use client';

import { useState, useEffect } from 'react';

export default function EmbedPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchPublicFiles();
  }, []);

  const fetchPublicFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/public/files');
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

  const isViewableFile = (mimeType: string) => {
    const viewableTypes = [
      'image/',
      'text/',
      'application/pdf',
      'video/',
      'audio/'
    ];
    return viewableTypes.some(type => mimeType.startsWith(type));
  };

  const getEmbedCode = (file: any, type: 'image' | 'iframe' | 'link') => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const fileUrl = `${baseUrl}/api/files/${file.id}?action=view`;
    const downloadUrl = `${baseUrl}/api/files/${file.id}?action=download`;

    switch (type) {
      case 'image':
        return `<img src="${fileUrl}" alt="${file.original_name}" style="max-width: 100%; height: auto;" />`;
      case 'iframe':
        return `<iframe src="${fileUrl}" width="100%" height="400" frameborder="0"></iframe>`;
      case 'link':
        return `<a href="${downloadUrl}" target="_blank">${file.original_name}</a>`;
      default:
        return '';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Code copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            File Embedding Guide
          </h1>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Available Public Files
            </h2>
            
            {files.length === 0 ? (
              <p className="text-gray-500">No public files available.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((file: any) => (
                  <div
                    key={file.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedFile?.id === file.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedFile(file)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.original_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {file.mime_type}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedFile && (
            <div className="space-y-6">
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Embedding Options for: {selectedFile.original_name}
                </h3>

                {/* Direct Link */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-2">Direct Link</h4>
                  <div className="bg-gray-100 p-3 rounded-md">
                    <code className="text-sm">
                      {typeof window !== 'undefined' ? window.location.origin : ''}/api/files/{selectedFile.id}?action=download
                    </code>
                    <button
                      onClick={() => copyToClipboard(
                        `${typeof window !== 'undefined' ? window.location.origin : ''}/api/files/${selectedFile.id}?action=download`
                      )}
                      className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* Image Embedding */}
                {isViewableFile(selectedFile.mime_type) && selectedFile.mime_type.startsWith('image/') && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-700 mb-2">Image Embedding</h4>
                    <div className="bg-gray-100 p-3 rounded-md">
                      <code className="text-sm">
                        {getEmbedCode(selectedFile, 'image')}
                      </code>
                      <button
                        onClick={() => copyToClipboard(getEmbedCode(selectedFile, 'image'))}
                        className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <div className="border rounded p-2 bg-white">
                        <img 
                          src={`/api/files/${selectedFile.id}?action=view`} 
                          alt={selectedFile.original_name}
                          className="max-w-xs h-auto"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Iframe Embedding */}
                {isViewableFile(selectedFile.mime_type) && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-700 mb-2">Iframe Embedding</h4>
                    <div className="bg-gray-100 p-3 rounded-md">
                      <code className="text-sm">
                        {getEmbedCode(selectedFile, 'iframe')}
                      </code>
                      <button
                        onClick={() => copyToClipboard(getEmbedCode(selectedFile, 'iframe'))}
                        className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <div className="border rounded bg-white">
                        <iframe 
                          src={`/api/files/${selectedFile.id}?action=view`}
                          width="100%" 
                          height="300" 
                          frameBorder="0"
                          className="rounded"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* HTML Link */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-2">HTML Link</h4>
                  <div className="bg-gray-100 p-3 rounded-md">
                    <code className="text-sm">
                      {getEmbedCode(selectedFile, 'link')}
                    </code>
                    <button
                      onClick={() => copyToClipboard(getEmbedCode(selectedFile, 'link'))}
                      className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* Usage Examples */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-2">Usage Examples</h4>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div>
                      <strong>In HTML:</strong> Use the img tag for images, iframe for documents, or a tag for downloads
                    </div>
                    <div>
                      <strong>In Markdown:</strong> <code>![alt text](url)</code> for images, <code>[link text](url)</code> for downloads
                    </div>
                    <div>
                      <strong>In React:</strong> Use the URLs directly in src or href attributes
                    </div>
                    <div>
                      <strong>In WordPress:</strong> Add the URL in the media library or use shortcodes
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
