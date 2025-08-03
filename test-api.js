// Simple API testing script
// Run with: node test-api.js

const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Helper function to make HTTP requests
function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            data: jsonData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: data,
            error: 'Invalid JSON response'
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

// Test functions
async function testHealthCheck() {
  console.log('\n🔍 Testing Health Check...');
  try {
    const response = await makeRequest('/api/health');
    console.log(`Status: ${response.statusCode}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.statusCode === 200;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function testGetAllInterns() {
  console.log('\n🔍 Testing GET /api/interns...');
  try {
    const response = await makeRequest('/api/interns');
    console.log(`Status: ${response.statusCode}`);
    if (response.data.success) {
      console.log(`✅ Found ${response.data.data.length} interns`);
      console.log('Pagination:', response.data.pagination);
      console.log('Sample intern:', response.data.data[0]?.firstName || 'No interns found');
    } else {
      console.log('❌ Error:', response.data.error);
    }
    return response.statusCode === 200 && response.data.success;
  } catch (error) {
    console.error('❌ Get all interns failed:', error.message);
    return false;
  }
}

async function testGetInternById() {
  console.log('\n🔍 Testing GET /api/interns/INT-001...');
  try {
    const response = await makeRequest('/api/interns/INT-001');
    console.log(`Status: ${response.statusCode}`);
    if (response.data.success) {
      const intern = response.data.data;
      console.log(`✅ Found intern: ${intern.fullName}`);
      console.log(`Department: ${intern.department}`);
      console.log(`Status: ${intern.status}`);
      console.log(`Progress: ${intern.progressPercentage}%`);
    } else {
      console.log('❌ Error:', response.data.error);
    }
    return response.statusCode === 200 && response.data.success;
  } catch (error) {
    console.error('❌ Get intern by ID failed:', error.message);
    return false;
  }
}

async function testDashboardStats() {
  console.log('\n🔍 Testing GET /api/dashboard/stats...');
  try {
    const response = await makeRequest('/api/dashboard/stats');
    console.log(`Status: ${response.statusCode}`);
    if (response.data.success) {
      const stats = response.data.data;
      console.log('✅ Dashboard stats retrieved successfully');
      console.log(`Total Interns: ${stats.metrics.totalInterns}`);
      console.log(`Active Applications: ${stats.metrics.activeApplications}`);
      console.log(`Interviews Scheduled: ${stats.metrics.interviewsScheduled}`);
      console.log(`Hired This Month: ${stats.metrics.hiredThisMonth}`);
      console.log(`Average GPA: ${stats.insights.averageGPA}`);
    } else {
      console.log('❌ Error:', response.data.error);
    }
    return response.statusCode === 200 && response.data.success;
  } catch (error) {
    console.error('❌ Dashboard stats failed:', error.message);
    return false;
  }
}

async function testWithFilters() {
  console.log('\n🔍 Testing GET /api/interns with filters...');
  try {
    const response = await makeRequest('/api/interns?status=Active&department=Engineering&sortBy=firstName');
    console.log(`Status: ${response.statusCode}`);
    if (response.data.success) {
      console.log(`✅ Found ${response.data.data.length} filtered interns`);
      console.log('Applied filters:', response.data.filters);
    } else {
      console.log('❌ Error:', response.data.error);
    }
    return response.statusCode === 200 && response.data.success;
  } catch (error) {
    console.error('❌ Filtered request failed:', error.message);
    return false;
  }
}

async function testInvalidId() {
  console.log('\n🔍 Testing GET /api/interns/INVALID-ID...');
  try {
    const response = await makeRequest('/api/interns/INVALID-ID');
    console.log(`Status: ${response.statusCode}`);
    if (response.statusCode === 400) {
      console.log('✅ Correctly rejected invalid ID format');
    } else {
      console.log('❌ Should have returned 400 for invalid ID');
    }
    return response.statusCode === 400;
  } catch (error) {
    console.error('❌ Invalid ID test failed:', error.message);
    return false;
  }
}

// Test creating a new intern
async function testCreateIntern() {
  console.log('\n🔍 Testing POST /api/interns...');
  try {
    const newIntern = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test.user@company.com',
      phone: '+1 (555) 999-0000',
      department: 'Engineering',
      university: 'Test University',
      gpa: 3.5,
      skills: ['Testing', 'JavaScript'],
      notes: 'Test intern created via API'
    };
    
    const response = await makeRequest('/api/interns', 'POST', newIntern);
    console.log(`Status: ${response.statusCode}`);
    if (response.statusCode === 201 && response.data.success) {
      console.log(`✅ Created intern: ${response.data.data.fullName || response.data.data.firstName + ' ' + response.data.data.lastName}`);
      console.log(`ID: ${response.data.data.id}`);
      // Store the ID for later tests
      global.testInternId = response.data.data.id;
      return true;
    } else {
      console.log('❌ Error:', response.data.error || 'Failed to create intern');
      if (response.data.details) {
        console.log('Details:', response.data.details);
      }
      return false;
    }
  } catch (error) {
    console.error('❌ Create intern test failed:', error.message);
    return false;
  }
}

// Test updating an intern
async function testUpdateIntern() {
  console.log('\n🔍 Testing PUT /api/interns/:id...');
  try {
    const internId = global.testInternId || 'INT-001'; // Use created intern or fallback
    const updateData = {
      phone: '+1 (555) 999-1111',
      gpa: 3.7,
      notes: 'Updated via API test'
    };
    
    const response = await makeRequest(`/api/interns/${internId}`, 'PUT', updateData);
    console.log(`Status: ${response.statusCode}`);
    if (response.statusCode === 200 && response.data.success) {
      console.log(`✅ Updated intern: ${response.data.data.firstName} ${response.data.data.lastName}`);
      console.log('Updated fields:', response.data.updatedFields);
      return true;
    } else {
      console.log('❌ Error:', response.data.error || 'Failed to update intern');
      if (response.data.details) {
        console.log('Details:', response.data.details);
      }
      return false;
    }
  } catch (error) {
    console.error('❌ Update intern test failed:', error.message);
    return false;
  }
}

// Test validation errors
async function testValidationErrors() {
  console.log('\n🔍 Testing validation errors...');
  try {
    const invalidIntern = {
      firstName: 'A', // Too short
      lastName: '', // Empty
      email: 'invalid-email', // Invalid format
      department: 'InvalidDept', // Invalid department
      gpa: 5.0 // Out of range
    };
    
    const response = await makeRequest('/api/interns', 'POST', invalidIntern);
    console.log(`Status: ${response.statusCode}`);
    if (response.statusCode === 400 && !response.data.success) {
      console.log('✅ Correctly rejected invalid data');
      console.log(`Found ${response.data.details.length} validation errors`);
      return true;
    } else {
      console.log('❌ Should have returned 400 for validation errors');
      return false;
    }
  } catch (error) {
    console.error('❌ Validation test failed:', error.message);
    return false;
  }
}

// Test email conflict
async function testEmailConflict() {
  console.log('\n🔍 Testing email conflict...');
  try {
    const duplicateIntern = {
      firstName: 'Duplicate',
      lastName: 'User',
      email: 'sarah.johnson@company.com', // Existing email
      department: 'Marketing'
    };
    
    const response = await makeRequest('/api/interns', 'POST', duplicateIntern);
    console.log(`Status: ${response.statusCode}`);
    if (response.statusCode === 409 && !response.data.success) {
      console.log('✅ Correctly rejected duplicate email');
      return true;
    } else {
      console.log('❌ Should have returned 409 for email conflict');
      return false;
    }
  } catch (error) {
    console.error('❌ Email conflict test failed:', error.message);
    return false;
  }
}

// Test deletion with safety checks
async function testDeleteIntern() {
  console.log('\n🔍 Testing DELETE /api/interns/:id...');
  try {
    const internId = global.testInternId || 'INT-999'; // Use created intern or non-existent ID
    
    // First try without confirmation
    const response1 = await makeRequest(`/api/interns/${internId}`, 'DELETE');
    console.log(`Status (without confirmation): ${response1.statusCode}`);
    if (response1.statusCode === 400) {
      console.log('✅ Correctly required confirmation');
    }
    
    // Then try with confirmation
    const response2 = await makeRequest(`/api/interns/${internId}?confirm=true`, 'DELETE');
    console.log(`Status (with confirmation): ${response2.statusCode}`);
    if (response2.statusCode === 200 && response2.data.success) {
      console.log(`✅ Successfully deleted intern`);
      return true;
    } else if (response2.statusCode === 404) {
      console.log('✅ Correctly handled non-existent intern');
      return true;
    } else {
      console.log('❌ Error:', response2.data.error || 'Unexpected response');
      return false;
    }
  } catch (error) {
    console.error('❌ Delete intern test failed:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting API Tests...');
  console.log('Make sure the server is running on http://localhost:3000');
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Get All Interns', fn: testGetAllInterns },
    { name: 'Get Intern by ID', fn: testGetInternById },
    { name: 'Dashboard Stats', fn: testDashboardStats },
    { name: 'Filtered Search', fn: testWithFilters },
    { name: 'Invalid ID Handling', fn: testInvalidId },
    { name: 'Create New Intern', fn: testCreateIntern },
    { name: 'Update Intern', fn: testUpdateIntern },
    { name: 'Validation Errors', fn: testValidationErrors },
    { name: 'Email Conflict', fn: testEmailConflict },
    { name: 'Delete Intern', fn: testDeleteIntern }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await test.fn();
    if (result) {
      passed++;
      console.log(`✅ ${test.name} passed`);
    } else {
      failed++;
      console.log(`❌ ${test.name} failed`);
    }
  }
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! API is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check server logs for details.');
  }
}

// Check if server is running first
async function checkServer() {
  try {
    await makeRequest('/api/health');
    return true;
  } catch (error) {
    console.log('❌ Server is not running. Please start the server with: npm start');
    console.log('   Then run this test again with: node test-api.js');
    return false;
  }
}

// Main execution
(async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runAllTests();
  }
})();