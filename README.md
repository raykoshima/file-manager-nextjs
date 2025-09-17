# File Management System

A secure file management system built with Next.js that allows users to upload, manage, and share files with authentication and access control.

## Features

### Authentication
- User registration and login
- JWT-based authentication with HTTP-only cookies
- Secure password hashing with bcrypt

### File Management
- **Upload files** (login required)
  - Set expiration time (1 day, 3 days, 7 days, 30 days, or never)
  - Make files public or private
  - File size limit: 10MB
- **View and download files**
  - Public files accessible to everyone
  - Private files only accessible to owner
  - Restricted file types (.exe, .zip, etc.) require authentication
- **File expiration**
  - Automatic cleanup of expired files
  - Default expiration: 7 days
- **Access control**
  - Non-logged users can only view/download public files
  - Restricted file types require authentication
  - File owners can delete their files

### Security Features
- File type restrictions for non-authenticated users
- Automatic file expiration and cleanup
- Secure file storage with unique filenames
- Access control based on file ownership and public/private status

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite
- **Authentication**: JWT with bcrypt
- **File Storage**: Local filesystem

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd file-manage-system
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Database Setup

The SQLite database will be automatically created and initialized when you first run the application. The database file will be created at `uploads/database.sqlite`.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

### File Management
- `POST /api/files/upload` - Upload a file (requires authentication)
- `GET /api/files` - Get user's files (requires authentication)
- `GET /api/files/[id]` - View/download a file
- `DELETE /api/files/[id]` - Delete a file (requires authentication)
- `GET /api/public/files` - Get public files (no authentication required)

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # Authentication endpoints
│   │   ├── files/         # File management endpoints
│   │   └── public/        # Public file endpoints
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AuthModal.tsx      # Login/Register modal
│   ├── FileManager.tsx    # Main file management component
│   ├── FileUpload.tsx     # File upload form
│   └── FileList.tsx       # File listing component
└── lib/
    ├── auth.ts            # Authentication utilities
    ├── database.ts        # Database configuration
    ├── fileUtils.ts       # File handling utilities
    └── init.ts            # Database initialization
```

## Usage

### For Logged-in Users
1. **Upload Files**: Click "Upload Files" and select a file
2. **Set Expiration**: Choose how long the file should be available (default: 7 days)
3. **Make Public**: Check the box to make the file accessible to non-logged users
4. **Manage Files**: View, download, or delete your files from the file list

### For Non-logged Users
1. **View Public Files**: Browse files marked as public by logged-in users
2. **Download Files**: Download any public file (except restricted types)
3. **Restricted Access**: Some file types (.exe, .zip, etc.) require authentication

## Security Considerations

- Files are stored with unique names to prevent conflicts
- Expired files are automatically deleted
- File type restrictions prevent unauthorized access to executable files
- All file operations are validated and sanitized
- Authentication tokens are stored in HTTP-only cookies

## Environment Variables

Create a `.env.local` file in the root directory:

```env
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

## License

This project is open source and available under the [MIT License](LICENSE).
