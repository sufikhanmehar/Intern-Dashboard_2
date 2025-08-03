const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Debug logging for Railway
console.log('🔍 Starting server initialization...');
console.log('📍 Current working directory:', process.cwd());
console.log('📍 __dirname:', __dirname);
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
console.log('🚪 Port:', PORT);

// Ensure data directory exists (for Railway deployment)
const dataDir = path.join(__dirname, 'data');
console.log('📁 Checking data directory:', dataDir);

try {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log('✅ Created data directory for Railway deployment');
    } else {
        console.log('✅ Data directory already exists');
    }
} catch (error) {
    console.error('❌ Failed to create data directory:', error);
    // Continue without failing - we'll handle this gracefully
}

// Ensure interns.json exists with default data
const internsFile = path.join(dataDir, 'interns.json');
console.log('📄 Checking interns file:', internsFile);

try {
    if (!fs.existsSync(internsFile)) {
    const defaultData = {
        "interns": [
            {
                "id": "INT-001",
                "firstName": "Sarah",
                "lastName": "Johnson",
                "email": "sarah.johnson@company.com",
                "phone": "+1 (555) 123-4567",
                "department": "Engineering",
                "status": "Active",
                "startDate": "2024-01-15",
                "endDate": "2024-07-15",
                "university": "MIT",
                "gpa": 3.9,
                "skills": ["JavaScript", "React", "Node.js", "Python"],
                "projects": ["Web Dashboard", "API Development"],
                "notes": "Excellent performance in frontend development tasks.",
                "createdAt": "2024-01-10T09:00:00.000Z"
            },
            {
                "id": "INT-002",
                "firstName": "Michael",
                "lastName": "Chen",
                "email": "michael.chen@company.com",
                "phone": "+1 (555) 987-6543",
                "department": "Data Science",
                "status": "Active",
                "startDate": "2024-02-01",
                "endDate": "2024-08-01",
                "university": "Stanford University",
                "gpa": 3.85,
                "skills": ["Python", "Machine Learning", "SQL", "TensorFlow"],
                "projects": ["Customer Analytics", "Predictive Modeling"],
                "notes": "Strong analytical skills and quick learner.",
                "createdAt": "2024-01-25T10:30:00.000Z"
            }
        ]
    };
        fs.writeFileSync(internsFile, JSON.stringify(defaultData, null, 2));
        console.log('✅ Created default interns.json for Railway deployment');
    } else {
        console.log('✅ Interns file already exists');
    }
} catch (error) {
    console.error('❌ Failed to create interns file:', error);
    // Continue without failing - the model will handle missing files gracefully
}

// Middleware with error handling
console.log('🔧 Setting up middleware...');

try {
    // Security middleware
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https:"],
            },
        },
    }));
    console.log('✅ Helmet security middleware configured');

    // CORS middleware
    app.use(cors({
        origin: process.env.NODE_ENV === 'production' 
            ? [/\.railway\.app$/, /\.up\.railway\.app$/]
            : true,
        credentials: true
    }));
    console.log('✅ CORS middleware configured');

    // Body parser middleware
    app.use(bodyParser.json({ limit: '10mb' }));
    app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
    console.log('✅ Body parser middleware configured');

    // Logging middleware
    const logFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
    app.use(morgan(logFormat));
    console.log('✅ Morgan logging middleware configured');

} catch (error) {
    console.error('❌ Failed to configure middleware:', error);
    process.exit(1);
}

// Serve static files
console.log('📁 Setting up static file serving...');
try {
    app.use(express.static(path.join(__dirname)));
    console.log('✅ Static file serving configured');
} catch (error) {
    console.error('❌ Failed to setup static files:', error);
}

// Health check route
app.get('/api/health', (req, res) => {
    try {
        res.status(200).json({
            status: 'OK',
            message: 'Intern Dashboard Server is running',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            version: '1.0.0',
            dataDirectory: dataDir,
            dataFileExists: fs.existsSync(internsFile)
        });
    } catch (error) {
        console.error('❌ Health check error:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Health check failed',
            error: error.message
        });
    }
});

// API Routes with error handling
console.log('🔌 Setting up API routes...');
try {
    const internRoutes = require('./routes/interns');
    const dashboardRoutes = require('./routes/dashboard');

    app.use('/api/interns', internRoutes);
    app.use('/api/dashboard', dashboardRoutes);
    console.log('✅ API routes configured successfully');
} catch (error) {
    console.error('❌ Failed to setup API routes:', error);
    console.error('This might be due to missing route files or dependencies');
    
    // Provide fallback routes
    app.use('/api/interns', (req, res) => {
        res.status(503).json({
            error: 'API temporarily unavailable',
            message: 'Route configuration failed'
        });
    });
    
    app.use('/api/dashboard', (req, res) => {
        res.status(503).json({
            error: 'Dashboard API temporarily unavailable',
            message: 'Route configuration failed'
        });
    });
}

app.get('/api/status', (req, res) => {
  res.json({
    server: 'Intern Dashboard API',
    version: '1.0.0',
    status: 'active'
  });
});

// Serve the main HTML file for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🚨 Error occurred:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server with comprehensive logging
console.log('🚀 Starting server...');
console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🚪 Port: ${PORT}`);
console.log(`📁 Data directory: ${dataDir}`);
console.log(`📄 Interns file: ${internsFile}`);

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server successfully started!`);
    console.log(`🚀 Intern Dashboard Server is running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Dashboard: ${process.env.NODE_ENV === 'production' ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN || 'your-app.railway.app'}` : `http://localhost:${PORT}`}`);
    console.log(`🔍 Health Check: ${process.env.NODE_ENV === 'production' ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN || 'your-app.railway.app'}` : `http://localhost:${PORT}`}/api/health`);
    console.log(`📈 API Status: ${process.env.NODE_ENV === 'production' ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN || 'your-app.railway.app'}` : `http://localhost:${PORT}`}/api/status`);
    console.log(`🎯 Server ready to handle requests`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
});

module.exports = app;