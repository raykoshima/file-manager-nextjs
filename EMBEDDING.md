# File Embedding Guide

This file management system supports embedding files on websites through direct URLs. Files can be embedded as images, iframes, or direct download links.

## 🔗 URL Structure

All files are accessible through these URL patterns:

- **View File**: `/api/files/{fileId}?action=view`
- **Download File**: `/api/files/{fileId}?action=download`
- **File Info**: `/api/files/{fileId}/info` (returns JSON with embed codes)

## 🖼️ Image Embedding

For image files (jpg, png, gif, webp, etc.), you can embed them directly:

### HTML
```html
<img src="https://yoursite.com/api/files/123?action=view" alt="My Image" style="max-width: 100%; height: auto;" />
```

### Markdown
```markdown
![My Image](https://yoursite.com/api/files/123?action=view)
```

### React
```jsx
<img src="/api/files/123?action=view" alt="My Image" className="max-w-full h-auto" />
```

## 📄 Document Embedding

For viewable documents (PDF, text files, etc.), use iframes:

### HTML
```html
<iframe src="https://yoursite.com/api/files/123?action=view" width="100%" height="400" frameborder="0"></iframe>
```

### React
```jsx
<iframe src="/api/files/123?action=view" width="100%" height="400" frameBorder="0" />
```

## 🔗 Direct Download Links

For any file type, you can create download links:

### HTML
```html
<a href="https://yoursite.com/api/files/123?action=download" target="_blank">Download File</a>
```

### Markdown
```markdown
[Download File](https://yoursite.com/api/files/123?action=download)
```

## 📊 File Information API

Get detailed file information including pre-generated embed codes:

```javascript
fetch('/api/files/123/info')
  .then(response => response.json())
  .then(data => {
    console.log(data.urls.view);        // View URL
    console.log(data.urls.download);    // Download URL
    console.log(data.embed.image);      // HTML img tag
    console.log(data.embed.iframe);     // HTML iframe tag
    console.log(data.embed.link);       // HTML link tag
  });
```

## 🎯 Supported File Types for Embedding

### Images (Direct embedding)
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- SVG (.svg)
- BMP (.bmp)

### Documents (Iframe embedding)
- PDF (.pdf)
- Text files (.txt, .md, .json, .xml, etc.)
- HTML (.html, .htm)

### Media (Iframe embedding)
- Video files (.mp4, .webm, .ogg)
- Audio files (.mp3, .wav, .ogg)

### Downloads (Link only)
- All file types can be downloaded
- Executable files (.exe, .msi) require authentication
- Archive files (.zip, .rar, .7z) require authentication

## 🔒 Access Control

### Public Files
- Accessible to everyone
- Can be embedded on any website
- No authentication required

### Private Files
- Only accessible to the file owner
- Authentication required for access
- Cannot be embedded publicly

### Restricted Files
- Executable and archive files require authentication
- Even if public, these files need login to view/download
- This is a security feature to prevent malicious file execution

## 🌐 Cross-Origin Embedding

The system supports cross-origin embedding:

1. **CORS Headers**: Properly configured for cross-origin requests
2. **Content-Type**: Files are served with correct MIME types
3. **Cache Headers**: Appropriate caching for better performance

## 📱 Responsive Embedding

### Images
```html
<img src="/api/files/123?action=view" 
     alt="Description" 
     style="max-width: 100%; height: auto;" 
     loading="lazy" />
```

### Documents
```html
<iframe src="/api/files/123?action=view" 
        width="100%" 
        height="400" 
        frameborder="0"
        style="border: 1px solid #ccc; border-radius: 4px;">
</iframe>
```

## 🔧 Advanced Usage

### Custom Styling
```html
<div class="file-embed">
  <img src="/api/files/123?action=view" 
       alt="Custom styled image"
       class="rounded-lg shadow-md hover:shadow-lg transition-shadow" />
</div>
```

### Error Handling
```javascript
const img = document.createElement('img');
img.src = '/api/files/123?action=view';
img.onerror = function() {
  this.src = '/placeholder-image.png';
  this.alt = 'File not available';
};
```

### Lazy Loading
```html
<img src="/api/files/123?action=view" 
     alt="Lazy loaded image"
     loading="lazy"
     decoding="async" />
```

## 🚀 Performance Tips

1. **Use appropriate file sizes** - Large files will load slowly
2. **Enable compression** - Images are served with proper compression
3. **Use lazy loading** - Load images only when needed
4. **Cache files** - Files are cached for better performance
5. **Choose right format** - Use WebP for images when possible

## 🔍 SEO Considerations

- Files are served with proper MIME types
- Alt text should be descriptive for images
- Use semantic HTML for better accessibility
- Consider using structured data for rich snippets

## 🛠️ Troubleshooting

### Common Issues

1. **File not loading**: Check if file is public and not expired
2. **Authentication required**: File might be private or restricted
3. **CORS errors**: Ensure proper domain configuration
4. **Slow loading**: Check file size and network connection

### Debug Steps

1. Check file URL directly in browser
2. Verify file permissions and expiration
3. Check browser console for errors
4. Test with different file types

## 📝 Examples

### WordPress
```php
// In your theme or plugin
$file_url = 'https://yoursite.com/api/files/123?action=view';
echo '<img src="' . esc_url($file_url) . '" alt="Embedded file" />';
```

### Drupal
```php
// In a custom module
$file_url = 'https://yoursite.com/api/files/123?action=view';
$render_array = [
  '#type' => 'html_tag',
  '#tag' => 'img',
  '#attributes' => [
    'src' => $file_url,
    'alt' => 'Embedded file',
  ],
];
```

### Vue.js
```vue
<template>
  <img :src="fileUrl" :alt="fileName" class="embedded-file" />
</template>

<script>
export default {
  data() {
    return {
      fileUrl: '/api/files/123?action=view',
      fileName: 'My File'
    }
  }
}
</script>
```

This embedding system provides flexible options for integrating files into any website or application!
