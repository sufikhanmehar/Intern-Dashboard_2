# Intern Dashboard

A modern web application for managing intern applications and tracking internship programs.

## Features

- **Interactive Dashboard**: Real-time metrics and analytics
- **Intern Management**: View, filter, and sort intern information
- **Application System**: Online form for new intern applications
- **Responsive Design**: Mobile-friendly interface
- **Search & Filter**: Advanced table functionality

## Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- CSS Grid & Flexbox for responsive layouts
- Modern UI with smooth animations

### Backend
- Node.js with Express.js
- CORS enabled for cross-origin requests
- Security middleware with Helmet
- Request logging with Morgan

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Start the production server:
```bash
npm start
```

5. Open your browser and navigate to:
```
http://localhost:3000
```

## API Endpoints

### Health Check
- **GET** `/api/health` - Server health status
- **GET** `/api/status` - API status information

### Response Format
```json
{
  "status": "OK",
  "message": "Intern Dashboard Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

## Project Structure

```
dashboard/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Data models
├── routes/          # API routes
├── index.html       # Main dashboard page
├── server.js        # Express server
├── package.json     # Dependencies and scripts
└── README.md        # This file
```

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (not implemented yet)

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
```

## Deployment

### Railway.app Deployment

This application is configured for Railway deployment with:

- `railway.toml` configuration file
- Production-ready middleware
- Automatic data directory creation
- Graceful shutdown handling
- Health check endpoint

To deploy to Railway:

1. Push code to your Git repository
2. Connect repository to Railway
3. Set environment variables:
   - `NODE_ENV=production`
4. Deploy using Railway's automatic deployment

### Production Features

- ✅ Proper port binding (`0.0.0.0:PORT`)
- ✅ Environment-based configuration
- ✅ CORS setup for production domains
- ✅ Security headers with Helmet
- ✅ Graceful shutdown handling
- ✅ Error logging and monitoring
- ✅ Health check endpoints
- ✅ Automatic data directory creation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

## License

This project is licensed under the MIT License.