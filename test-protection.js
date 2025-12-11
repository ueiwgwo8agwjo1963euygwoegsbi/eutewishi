#!/usr/bin/env node

// Simple test to demonstrate the protection without requiring all dependencies
const http = require('http');

console.log('🧪 Testing Domain Protection...\n');

// Simulate the host protection logic
const ALLOWED_HOSTS = [
    'jrmph-freesmsapi.onrender.com',  // Official domain
    'localhost:3000',              // Development
    'localhost',                   // Development
    '127.0.0.1:3000',             // Development
    '127.0.0.1'                   // Development
];

function testHost(host) {
    const isAllowed = ALLOWED_HOSTS.some(allowedHost => {
        if (allowedHost === 'localhost:3000') {
            return host === 'localhost:3000' || host === 'localhost' || host === '127.0.0.1:3000' || host === '127.0.0.1';
        }
        return host === allowedHost;
    });

    console.log(`Testing host: "${host}"`);
    console.log(`Result: ${isAllowed ? '✅ ALLOWED' : '❌ BLOCKED'}\n`);
}

// Test cases
testHost('jrmph-freesmsapi.onrender.com');    // ✅ Should allow
testHost('localhost:3000');               // ✅ Should allow
testHost('localhost');                    // ✅ Should allow
testHost('127.0.0.1:3000');              // ✅ Should allow
testHost('other-domain.com');             // ❌ Should block
testHost('someone-elses-api.onrender.com'); // ❌ Should block
testHost('fake-site.com');                // ❌ Should block

console.log('🔒 Protection Summary:');
console.log('- Only your official domain (jrmph-freesmsapi.onrender.com) is allowed');
console.log('- Development hosts (localhost) are allowed for testing');
console.log('- All other domains are blocked');
console.log('\nThis prevents API cloning and unauthorized hosting! 🚀');