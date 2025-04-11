# DocuWhisper Backend

A robust Node.js backend for the DocuWhisper document management system. This API provides secure authentication, file management, and folder organization capabilities.

## Features

- 🔒 JWT-based authentication
- 📁 Folder-based document organization
- 📝 File upload and management
- 🔍 Advanced search functionality
- 📧 Email notifications
- 🔐 Role-based access control
- 🌐 CORS configuration for frontend integration

## Tech Stack

- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Nodemailer
- Multer (file uploads)
- CORS

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Files
- `GET /api/files` - Get all files
- `POST /api/files` - Upload a new file
- `GET /api/files/:id` - Get file by ID
- `PUT /api/files/:id` - Update file
- `DELETE /api/files/:id` - Delete file
- `GET /api/files/search` - Search files

### Folders
- `GET /api/folders` - Get all folders
- `POST /api/folders` - Create a new folder
- `GET /api/folders/:id` - Get folder by ID
- `PUT /api/folders/:id` - Update folder
- `DELETE /api/folders/:id` - Delete folder

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/salmaelmokharek/DucuWhisper_backend.git
cd DucuWhisper_backend
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# Create .env file
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

4. Start the development server
```bash
npm run dev
```

5. Access the API
- API: http://localhost:5000

## Project Structure

```
backend/
├── api/              # API routes and controllers
├── config/           # Configuration files
├── middleware/       # Custom middleware
├── models/           # MongoDB models
├── routes/           # Route definitions
├── uploads/          # Uploaded files storage
├── .env              # Environment variables
└── index.js          # Entry point
```

## Deployment

The backend is deployed on Vercel at: [ducu-whisper-backend.vercel.app](https://ducu-whisper-backend.vercel.app)

### Deployment Steps
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set up environment variables in Vercel
4. Deploy

## Frontend Integration

This backend is designed to work with the DocuWhisper frontend:
[https://github.com/yourusername/docuwhisper-frontend](https://github.com/yourusername/docuwhisper-frontend)

