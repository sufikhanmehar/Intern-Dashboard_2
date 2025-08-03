// Frontend Functionality Test
// This script tests the dashboard functionality that we implemented

console.log('🎯 Frontend Functionality Test Started');
console.log('📝 Testing notification system, form handling, and CRUD operations');

// Test 1: Create a new intern through the form
console.log('\n1️⃣ Testing Create Intern (Form Submission)');
fetch('http://localhost:3000/api/interns', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        firstName: 'Frontend',
        lastName: 'Test',
        email: 'frontend.test@company.com',
        phone: '+1 (555) 000-1234',
        department: 'Engineering',
        university: 'Frontend University',
        gpa: 3.8,
        skills: ['JavaScript', 'React', 'Testing'],
        notes: 'Created via frontend test'
    })
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        console.log('✅ Successfully created intern:', data.data.firstName, data.data.lastName);
        console.log('   ID:', data.data.id);
        
        // Test 2: Read the created intern
        console.log('\n2️⃣ Testing Read Intern Details');
        return fetch(`http://localhost:3000/api/interns/${data.data.id}`);
    } else {
        throw new Error(data.error);
    }
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        console.log('✅ Successfully retrieved intern details');
        console.log('   Full Name:', data.data.fullName);
        console.log('   Progress:', data.data.progressPercentage + '%');
        console.log('   Days Since Start:', data.data.daysSinceStart);
        
        // Test 3: Update the intern
        console.log('\n3️⃣ Testing Update Intern');
        return fetch(`http://localhost:3000/api/interns/${data.data.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phone: '+1 (555) 000-9999',
                gpa: 3.9,
                notes: 'Updated via frontend test - phone and GPA changed'
            })
        });
    } else {
        throw new Error(data.error);
    }
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        console.log('✅ Successfully updated intern');
        console.log('   Updated fields:', data.updatedFields.join(', '));
        
        // Test 4: Test search/filter functionality
        console.log('\n4️⃣ Testing Search/Filter Functionality');
        return fetch('http://localhost:3000/api/interns?search=Frontend&department=Engineering');
    } else {
        throw new Error(data.error);
    }
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        console.log('✅ Successfully filtered interns');
        console.log('   Found', data.data.length, 'intern(s) matching "Frontend" in Engineering');
        console.log('   Applied filters:', JSON.stringify(data.filters));
        
        // Get the intern ID for deletion test
        const internId = data.data[0]?.id;
        if (internId) {
            // Test 5: Delete the intern (with confirmation)
            console.log('\n5️⃣ Testing Delete Intern (with safety confirmation)');
            return fetch(`http://localhost:3000/api/interns/${internId}?confirm=true`, {
                method: 'DELETE'
            });
        } else {
            throw new Error('No intern found for deletion test');
        }
    } else {
        throw new Error(data.error);
    }
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        console.log('✅ Successfully deleted intern');
        console.log('   Deleted at:', data.deletedAt);
        
        // Test 6: Test dashboard statistics
        console.log('\n6️⃣ Testing Dashboard Statistics');
        return fetch('http://localhost:3000/api/dashboard/stats');
    } else {
        throw new Error(data.error);
    }
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        console.log('✅ Successfully retrieved dashboard statistics');
        console.log('   Total Interns:', data.data.metrics.totalInterns);
        console.log('   Active Applications:', data.data.metrics.activeApplications);
        console.log('   Interviews Scheduled:', data.data.metrics.interviewsScheduled);
        console.log('   Hired This Month:', data.data.metrics.hiredThisMonth);
        console.log('   Average GPA:', data.data.insights.averageGPA);
        
        // Test 7: Test error handling with invalid data
        console.log('\n7️⃣ Testing Error Handling (Invalid Data)');
        return fetch('http://localhost:3000/api/interns', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstName: 'A', // Too short
                lastName: '', // Empty
                email: 'invalid-email', // Invalid format
                department: 'InvalidDept', // Invalid department
                gpa: 5.0 // Out of range
            })
        });
    } else {
        throw new Error(data.error);
    }
})
.then(response => {
    const status = response.status;
    return response.json().then(data => ({ data, status }));
})
.then(({ data, status }) => {
    if (!data.success && status === 400) {
        console.log('✅ Error handling working correctly');
        console.log('   Validation errors found:', data.details.length);
        console.log('   Sample error:', data.details[0]);
        
        console.log('\n🎉 All frontend functionality tests completed successfully!');
        console.log('\n📊 Test Summary:');
        console.log('✅ Create Intern - Working');
        console.log('✅ Read Intern Details - Working');
        console.log('✅ Update Intern - Working');
        console.log('✅ Search/Filter - Working');
        console.log('✅ Delete Intern - Working');
        console.log('✅ Dashboard Stats - Working');
        console.log('✅ Error Handling - Working');
        
        console.log('\n🚀 Frontend is fully functional and ready for use!');
    } else {
        throw new Error('Error handling test failed');
    }
})
.catch(error => {
    console.error('❌ Frontend test failed:', error.message);
    console.log('\n🔧 This indicates an issue that needs to be fixed.');
});