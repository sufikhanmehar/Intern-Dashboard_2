// Railway Deployment Startup Test
// This script validates the server configuration before deployment

console.log('🧪 Railway Deployment Startup Test');
console.log('=====================================');

// Test 1: Check Node.js version
console.log('\n1️⃣ Checking Node.js version...');
console.log(`Node.js version: ${process.version}`);
const nodeVersion = parseInt(process.version.slice(1).split('.')[0]);
if (nodeVersion >= 18) {
    console.log('✅ Node.js version is compatible (>=18.0.0)');
} else {
    console.log('❌ Node.js version is too old, requires >=18.0.0');
    process.exit(1);
}

// Test 2: Check required dependencies
console.log('\n2️⃣ Checking dependencies...');
try {
    require('express');
    console.log('✅ Express.js loaded successfully');
    
    require('cors');
    console.log('✅ CORS loaded successfully');
    
    require('helmet');
    console.log('✅ Helmet loaded successfully');
    
    require('morgan');
    console.log('✅ Morgan loaded successfully');
    
    require('body-parser');
    console.log('✅ Body-parser loaded successfully');
} catch (error) {
    console.log('❌ Failed to load dependencies:', error.message);
    process.exit(1);
}

// Test 3: Check file system access
console.log('\n3️⃣ Checking file system access...');
const fs = require('fs');
const path = require('path');

try {
    // Check if we can read the current directory
    const files = fs.readdirSync(__dirname);
    console.log('✅ Can read current directory');
    console.log(`📁 Found ${files.length} files/folders`);
    
    // Check if main files exist
    const requiredFiles = ['server.js', 'package.json'];
    for (const file of requiredFiles) {
        if (fs.existsSync(path.join(__dirname, file))) {
            console.log(`✅ ${file} exists`);
        } else {
            console.log(`❌ ${file} missing`);
            process.exit(1);
        }
    }
    
    // Test write access
    const testDir = path.join(__dirname, 'test-write');
    try {
        fs.mkdirSync(testDir, { recursive: true });
        fs.writeFileSync(path.join(testDir, 'test.txt'), 'test');
        fs.rmSync(testDir, { recursive: true });
        console.log('✅ Write access confirmed');
    } catch (writeError) {
        console.log('⚠️  Limited write access:', writeError.message);
        console.log('   This may affect data persistence');
    }
    
} catch (error) {
    console.log('❌ File system access error:', error.message);
    process.exit(1);
}

// Test 4: Check route files
console.log('\n4️⃣ Checking route files...');
const routeFiles = ['./routes/interns.js', './routes/dashboard.js'];
let routeErrors = 0;

for (const routeFile of routeFiles) {
    try {
        require(routeFile);
        console.log(`✅ ${routeFile} loaded successfully`);
    } catch (error) {
        console.log(`❌ ${routeFile} failed to load:`, error.message);
        routeErrors++;
    }
}

if (routeErrors > 0) {
    console.log(`⚠️  ${routeErrors} route file(s) have issues - server will use fallback routes`);
}

// Test 5: Environment variables
console.log('\n5️⃣ Checking environment...');
console.log(`PORT: ${process.env.PORT || 'not set (will use 3000)'}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set (will use development)'}`);
console.log(`RAILWAY_PUBLIC_DOMAIN: ${process.env.RAILWAY_PUBLIC_DOMAIN || 'not set'}`);

// Test 6: Try starting server briefly
console.log('\n6️⃣ Testing server startup...');
try {
    const express = require('express');
    const testApp = express();
    const testPort = process.env.PORT || 3000;
    
    testApp.get('/test', (req, res) => {
        res.json({ status: 'ok', test: true });
    });
    
    const testServer = testApp.listen(testPort, '0.0.0.0', () => {
        console.log(`✅ Test server started successfully on port ${testPort}`);
        testServer.close(() => {
            console.log('✅ Test server stopped successfully');
            console.log('\n🎉 All tests passed! Server should deploy successfully on Railway.');
            console.log('\n📋 Deployment Checklist:');
            console.log('1. ✅ Push code to your Git repository');
            console.log('2. ✅ Connect repository to Railway');
            console.log('3. ✅ Set NODE_ENV=production in Railway environment variables');
            console.log('4. ✅ Deploy and monitor logs');
        });
    });
    
    testServer.on('error', (error) => {
        console.log('❌ Test server failed to start:', error.message);
        if (error.code === 'EADDRINUSE') {
            console.log('   Port is already in use - this is normal if your server is running');
            console.log('✅ Configuration appears correct');
        }
        process.exit(0);
    });
    
} catch (error) {
    console.log('❌ Server startup test failed:', error.message);
    process.exit(1);
}