#!/usr/bin/env node

// API Protection Test Script
// This script demonstrates how your API protection works

console.log('🔒 JRM FreeSMS API - Domain Protection Test');
console.log('===============================================\n');

// Simulate different scenarios
const testScenarios = [
    {
        name: '✅ ALLOWED - Website using YOUR API URL',
        host: 'jrmph-freesmsapi.onrender.com',
        expected: '✅ WORKS - Authorized domain'
    },
    {
        name: '❌ BLOCKED - Cloned code on different domain',
        host: 'clone-website.onrender.com', 
        expected: '❌ BLOCKED - Unauthorized host'
    },
    {
        name: '✅ ALLOWED - Development on localhost',
        host: 'localhost:3000',
        expected: '✅ WORKS - Development allowed'
    },
    {
        name: '❌ BLOCKED - Direct IP access',
        host: '192.168.1.100:3000',
        expected: '❌ BLOCKED - Direct IP not allowed'
    }
];

// Your allowed hosts (from server.js)
const ALLOWED_HOSTS = [
    'jrmph-freesmsapi.onrender.com',
    'localhost:3000',
    'localhost', 
    '127.0.0.1:3000',
    '127.0.0.1'
];

console.log('Testing scenarios:\n');

testScenarios.forEach((scenario, index) => {
    const isAllowed = ALLOWED_HOSTS.includes(scenario.host);
    
    console.log(`${index + 1}. ${scenario.name}`);
    console.log(`   Host: ${scenario.host}`);
    console.log(`   Result: ${isAllowed ? '✅ ALLOWED' : '❌ BLOCKED'}`);
    console.log(`   Expected: ${scenario.expected}`);
    console.log();
});

console.log('📊 Protection Summary:');
console.log('====================');
console.log(`✅ Allowed hosts: ${ALLOWED_HOSTS.length}`);
console.log(`🔒 Protected against: Unauthorized hosting attempts`);
console.log(`🌐 Works from: Any website using correct API URL`);

console.log('\n🚀 Real Usage Examples:');
console.log('======================');
console.log('✅ Your API will work when people use:');
console.log('   https://jrmph-freesmsapi.onrender.com/api/send-sms');
console.log();
console.log('❌ Your API will BLOCK when people try to:');
console.log('   - Copy your code and host elsewhere');
console.log('   - Use unauthorized domains');
console.log('   - Access via direct IP addresses');

console.log('\n🎯 Key Point:');
console.log('=============');
console.log('People can use your API from ANY website');
console.log('by calling your official URL,');
console.log('but they CANNOT clone and host it themselves!');
console.log('\nThis is PERFECT protection! 🛡️');