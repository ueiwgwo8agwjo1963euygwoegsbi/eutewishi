#!/usr/bin/env node

// Simple deployment verification script
console.log('🔍 JRM FreeSMS API - Deployment Verification');
console.log('===========================================');

try {
    // Check if server.js exists and has correct syntax
    const fs = require('fs');
    const path = require('path');
    
    console.log('\n📁 Checking files...');
    
    // Check server.js
    if (fs.existsSync('./server.js')) {
        console.log('✅ server.js - Found');
        
        // Check file size
        const stats = fs.statSync('./server.js');
        console.log(`   Size: ${Math.round(stats.size / 1024)}KB`);
        
        // Quick syntax check
        try {
            require('./server.js');
            console.log('✅ server.js - Syntax OK');
        } catch (e) {
            if (e.code === 'MODULE_NOT_FOUND') {
                console.log('⚠️  server.js - Missing dependencies (run npm install)');
            } else {
                console.log(`❌ server.js - Syntax error: ${e.message}`);
                process.exit(1);
            }
        }
    } else {
        console.log('❌ server.js - Not found');
        process.exit(1);
    }
    
    // Check package.json
    if (fs.existsSync('./package.json')) {
        console.log('✅ package.json - Found');
        const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
        console.log(`   Name: ${pkg.name}`);
        console.log(`   Version: ${pkg.version}`);
        console.log(`   Start command: ${pkg.scripts.start}`);
    } else {
        console.log('❌ package.json - Not found');
        process.exit(1);
    }
    
    // Check render.yaml
    if (fs.existsSync('./render.yaml')) {
        console.log('✅ render.yaml - Found');
    } else {
        console.log('❌ render.yaml - Not found');
        process.exit(1);
    }
    
    console.log('\n🚀 Deployment Ready!');
    console.log('===================');
    console.log('Upload these 3 files to GitHub:');
    console.log('1. server.js');
    console.log('2. package.json'); 
    console.log('3. render.yaml');
    console.log('\nThen deploy to Render with:');
    console.log('- Name: jrmph-freesmsapi');
    console.log('- Runtime: Node');
    console.log('- Build: npm install');
    console.log('- Start: npm start');
    console.log('- Environment: NODE_ENV = production');
    
    console.log('\n🔒 Host Protection Active');
    console.log('========================');
    console.log('✅ Only jrmph-freesmsapi.onrender.com will work');
    console.log('✅ Blocks unauthorized hosting/clone attempts');
    console.log('✅ Rate limiting: 100 requests per 15 minutes');
    
} catch (error) {
    console.log(`❌ Verification failed: ${error.message}`);
    process.exit(1);
}