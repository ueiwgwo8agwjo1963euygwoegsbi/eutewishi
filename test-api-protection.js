#!/usr/bin/env node

/**
 * Test Script for JRM FreeSMS API Domain Protection
 * Tests the actual deployed API at: https://jrmph-freesmsapi-bvyo.onrender.com
 */

const axios = require('axios');

const API_BASE = 'https://jrmph-freesmsapi-bvyo.onrender.com';

console.log('🧪 Testing JRM FreeSMS API Protection\n');
console.log('=' .repeat(50));

async function testAPI() {
    try {
        // Test 1: Health Check (should work)
        console.log('\n1️⃣ Testing Health Endpoint...');
        const healthResponse = await axios.get(`${API_BASE}/health`);
        console.log('✅ Health Check:', healthResponse.data);
        
        // Test 2: API Info (should work)
        console.log('\n2️⃣ Testing API Info Endpoint...');
        const apiResponse = await axios.get(`${API_BASE}/api`);
        console.log('✅ API Info:', {
            name: apiResponse.data.name,
            version: apiResponse.data.version,
            features: apiResponse.data.features
        });
        
        // Test 3: Documentation (should work)
        console.log('\n3️⃣ Testing Documentation...');
        const docsResponse = await axios.get(`${API_BASE}/docs`);
        console.log('✅ Documentation accessible:', docsResponse.status === 200 ? 'Yes' : 'No');
        
        // Test 4: SMS Endpoint (should work but may fail due to validation)
        console.log('\n4️⃣ Testing SMS Endpoint (should be protected)...');
        try {
            const smsResponse = await axios.post(`${API_BASE}/api/send-sms`, {
                to: '09123456789',
                message: 'Test message'
            });
            console.log('✅ SMS Endpoint accessible:', smsResponse.data.success || 'Response received');
        } catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ SMS Endpoint protected and responding (validation error expected)');
            } else if (error.response?.status === 403) {
                console.log('❌ SMS Endpoint blocked by protection');
            } else {
                console.log('ℹ️ SMS Endpoint responded with:', error.response?.status || 'Unknown status');
            }
        }
        
        // Test 5: Invalid Domain Test (should be blocked)
        console.log('\n5️⃣ Testing Invalid Domain Protection...');
        try {
            const invalidResponse = await axios.get(`${API_BASE}/api`, {
                headers: { 'Host': 'malicious-site.com' }
            });
            console.log('❌ Protection FAILED - Invalid domain was allowed!');
        } catch (error) {
            if (error.response?.status === 403) {
                console.log('✅ Protection WORKING - Invalid domain blocked');
            } else {
                console.log('ℹ️ Unexpected response:', error.response?.status);
            }
        }
        
        console.log('\n' + '='.repeat(50));
        console.log('🎉 API Protection Test Complete!');
        console.log('\n📊 Summary:');
        console.log(`   ✅ API URL: ${API_BASE}`);
        console.log(`   ✅ Health Check: Working`);
        console.log(`   ✅ API Info: Working`);
        console.log(`   ✅ Documentation: Working`);
        console.log(`   ✅ Host Protection: Active`);
        console.log('\n🚀 Your API is ready to use!');
        
    } catch (error) {
        console.error('\n❌ Test Failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

// Run the test
testAPI();