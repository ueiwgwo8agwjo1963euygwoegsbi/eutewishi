#!/usr/bin/env node


require('dotenv').config();

const express = require('express');

const cors = require('cors');

const helmet = require('helmet');

const rateLimit = require('express-rate-limit');

const axios = require('axios');

const qs = require('qs');


const app = express();

const PORT = process.env.PORT || 3000;


// ============================================================================
// HOST PROTECTION MIDDLEWARE - Prevents API cloning/scraping
// ============================================================================


// Allow localhost for development, but block other domains
const ALLOWED_HOSTS = [
    'jrmph-freesmsapi.onrender.com',        // Your original official Render domain
    'jrmph-freesmsapi-bvyo.onrender.com',   // New Render URL
    'localhost:3000',                       // Development
    'localhost',                            // Development
    '127.0.0.1:3000',                       // Development
    '127.0.0.1'                             // Development
];


app.use((req, res, next) => {
    const host = req.get('host');
    const isAllowed = ALLOWED_HOSTS.some(allowedHost => {
        if (allowedHost === 'localhost:3000') {
            return host === 'localhost:3000' || host === 'localhost' || host === '127.0.0.1:3000' || host === '127.0.0.1';
        }
        return host === allowedHost;
    });


    if (!isAllowed) {
        console.warn(`🚫 BLOCKED: Unauthorized host attempted access - Host: ${host}, IP: ${req.ip}`);
        return res.status(403).json({
            error: 'Access Denied',
            message: 'This API is only available from authorized domains.',
            yourHost: host,
            allowedHosts: ALLOWED_HOSTS.filter(h => h !== 'localhost:3000' && h !== 'localhost' && h !== '127.0.0.1:3000' && h !== '127.0.0.1')
        });
    }


    next();
});


// ============================================================================
// SECURITY MIDDLEWARE
// ============================================================================


// Security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"], // Added for Tailwind/Icons
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"], // Added for Tailwind JS
            connectSrc: ["'self'"]
        }
    }
}));


// CORS configuration - Only allow official domain
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [
        'https://jrmph-freesmsapi.onrender.com', // Official domain
        'https://jrmph-freesmsapi-bvyo.onrender.com', // New URL
        'http://localhost:3000', // Development
        'http://localhost', // Development
        'http://127.0.0.1:3000' // Development
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


// Rate limiting - 100 requests per 15 minutes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: 'Too many requests, please try again later.',
        retryAfter: '15 minutes',
        note: 'This API is protected and only works from authorized domains.'
    },
    standardHeaders: true,
    legacyHeaders: false
});


app.use('/api/', limiter);


// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


// Request logging
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip} - User-Agent: ${req.get('User-Agent')}`);
    next();
});


// ============================================================================
// UTILITY FUNCTIONS (FROM ORIGINAL SCRIPT - UNCHANGED)
// ============================================================================


function normalizePhone(input) {
    const number = input.replace(/\D/g, '');
    if (number.startsWith('09')) return '+63' + number.slice(1);
    if (number.startsWith('9') && number.length === 10) return '+63' + number;
    if (number.startsWith('63') && number.length === 12) return '+' + number;
    if (number.startsWith('+63') && number.length === 13) return number;
    return null;
}


function randomString(len) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: len }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}


function randomGmail() {
    return `${randomString(8)}@gmail.com`;
}


function randomUID() {
    return randomString(28);
}


function randomDeviceId() {
    return randomString(16);
}


function validatePhoneNumber(number) {
    const patterns = [
        /^(\+63|63|9)\d{9,10}$/, // Philippine formats
        /^\+?[1-9]\d{1,14}$/ // General international format
    ];
    return patterns.some(pattern => pattern.test(number));
}


function validateInput(data) {
    const errors = [];
    if (!data.number || typeof data.number !== 'string') {
        errors.push('Phone number is required and must be a string');
    } else if (!validatePhoneNumber(data.number)) {
        errors.push('Invalid phone number format');
    }

    if (!data.senderName || typeof data.senderName !== 'string') {
        errors.push('Sender name is required and must be a string');
    } else if (data.senderName.length > 50) {
        errors.push('Sender name must be 50 characters or less');
    }

    if (!data.message || typeof data.message !== 'string') {
        errors.push('Message is required and must be a string');
    } else if (data.message.length > 160) {
        errors.push('Message must be 160 characters or less');
    }
    return errors;
}


// ============================================================================
// SMS API HEADERS (UNCHANGED)
// ============================================================================


const headers = {
    'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 15; 2207117BPG Build/AP3A.240905.015.A2)',
    'Connection': 'Keep-Alive',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json'
};


// ============================================================================
// NO AUTHENTICATION MIDDLEWARE (PUBLIC ACCESS - UNCHANGED)
// ============================================================================


// Public access - no authentication required


// ============================================================================
// DOCUMENTATION GENERATION FUNCTION
// ============================================================================

function generateDocsHtml(req) {
    const baseUrl = `${req.protocol}://${req.get('host')}/api`;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SMS API Reference - v1.0.0</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f8fafc;
        }
        .code-block {
            background-color: #1f2937; /* Dark Slate */
            color: #e5e7eb; /* Light Gray text */
            padding: 1rem;
            border-radius: 0.5rem;
            overflow-x: auto;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            position: relative; 
        }
        .method-badge {
            font-size: 0.75rem;
            font-weight: 700;
            padding: 0.2rem 0.6rem;
            border-radius: 0.375rem;
        }
        /* Color Palette: Indigo for info/GET, Emerald for success/POST */
        .post { background-color: #059669; color: white; } /* Emerald-600 */
        .get { background-color: #4f46e5; color: white; } } /* Indigo-600 */
        .path-display {
            background-color: #e5e7eb;
            color: #4b5563;
            padding: 0.25rem 0.5rem;
            border-radius: 0.375rem;
            font-family: monospace;
        }
        .section-header {
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 0.5rem;
            margin-bottom: 1.5rem;
        }
        .copy-btn {
            background-color: #3b82f6;
        }
        .copy-btn:hover {
            background-color: #2563eb;
        }
    </style>
</head>
<body class="antialiased">

<div class="min-h-screen bg-gray-50">
    <!-- Header/Navigation -->
    <header class="bg-slate-900 shadow-2xl">
        <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
            <div class="flex items-center space-x-4">
                <!-- Icon: Speech Bubble/Message -->
                <svg class="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.505A9.761 9.761 0 0112 4c4.97 0 9 3.582 9 8z"></path></svg>
                <h1 class="text-3xl font-extrabold text-white tracking-tight">
                    SMS API Reference
                </h1>
            </div>
            <span class="mt-4 md:mt-0 text-sm font-medium text-slate-300 bg-slate-700 px-3 py-1 rounded-full shadow-inner">Version 1.0.0</span>
        </div>
    </header>

    <!-- Main Content Area -->
    <main class="max-w-7xl mx-auto py-10 sm:px-6 lg:px-8">
        <div class="space-y-12">

            <!-- 1. Overview & Base URL -->
            <div class="bg-white p-8 rounded-xl shadow-lg border-t-4 border-indigo-500">
                <h2 class="text-2xl font-semibold text-gray-900 section-header">Overview & Quick Start</h2>
                <p class="text-gray-600 mb-6">
                    This is a secure, rate-limited public API for sending SMS messages. The API is designed for high reliability and includes robust security features like rate limiting, CORS protection, and input validation.
                </p>

                <div class="grid md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-700 mb-2">Base Endpoint</h3>
                        <div class="code-block !bg-gray-700 text-yellow-300">
                            ${baseUrl}
                        </div>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-gray-700 mb-2">Authentication Status</h3>
                        <div class="bg-green-100 text-green-800 font-medium px-4 py-3 rounded-lg flex items-center shadow-inner">
                            <!-- Icon: Lock Open -->
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944c-1.278 0-2.529.288-3.67.844-1.141.556-2.138 1.378-2.948 2.378S3.333 7.6 3.09 8.889C2.846 10.178 2.89 11.511 3.2 12.822c.311 1.311.916 2.56 1.764 3.652 1.696 2.186 3.992 3.652 6.551 4.363 2.559-.711 4.855-2.177 6.551-4.363.848-1.092 1.453-2.341 1.764-3.652.31-1.311.354-2.644.11-3.933A11.955 11.955 0 0112 2.944z"></path></svg>
                            Public Access: No API Key Required
                        </div>
                    </div>
                </div>

                <h3 class="text-lg font-semibold text-gray-700 mb-2">Environment Variables</h3>
                <div class="code-block !bg-gray-700 text-blue-200">
                    <pre># Optional: Comma-separated allowed origins for CORS</pre>
                    <pre>ALLOWED_ORIGINS=https://your-domain.com,http://localhost:3000</pre>
                    <pre># Optional: Server port</pre>
                    <pre>PORT=3000</pre>
                </div>
            </div>

            <!-- 2. Send SMS Endpoint -->
            <div class="bg-white p-8 rounded-xl shadow-lg">
                <h2 class="text-2xl font-semibold text-gray-900 section-header">Endpoint: Send SMS</h2>

                <div class="flex items-center mb-4 space-x-4">
                    <span class="method-badge post">POST</span>
                    <span class="path-display font-mono text-lg">/send-sms</span>
                </div>
                <p class="text-gray-600 mb-6">Initiates the transmission of an SMS message to a specified mobile number. All inputs are validated for format and length.</p>

                <div class="grid md:grid-cols-2 gap-8">
                    <!-- Request -->
                    <div>
                        <h3 class="text-xl font-semibold text-gray-800 mb-3">Request Body (application/json)</h3>
                        <div class="code-block">
                            <pre>{
    "number": "09123456789",
    "senderName": "JhamesAPI",
    "message": "Hello from the new API documentation!"
}</pre>
                        </div>

                        <h4 class="text-lg font-semibold text-gray-700 mt-6 mb-3">Parameters</h4>
                        <div class="overflow-x-auto rounded-lg">
                            <table class="min-w-full divide-y divide-gray-200 border border-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parameter</th>
                                        <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required</th>
                                        <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    <tr>
                                        <td class="px-4 py-2 whitespace-nowrap font-medium text-gray-900">number</td>
                                        <td class="px-4 py-2 whitespace-nowrap">string</td>
                                        <td class="px-4 py-2 whitespace-nowrap"><span class="text-green-600 font-bold">YES</span></td>
                                        <td class="px-4 py-2">Target phone number. Automatically normalized to +63 format.</td>
                                    </tr>
                                    <tr>
                                        <td class="px-4 py-2 whitespace-nowrap font-medium text-gray-900">senderName</td>
                                        <td class="px-4 py-2 whitespace-nowrap">string</td>
                                        <td class="px-4 py-2 whitespace-nowrap"><span class="text-green-600 font-bold">YES</span></td>
                                        <td class="px-4 py-2">Name to use as the sender. Max 50 characters.</td>
                                    </tr>
                                    <tr>
                                        <td class="px-4 py-2 whitespace-nowrap font-medium text-gray-900">message</td>
                                        <td class="px-4 py-2 whitespace-nowrap">string</td>
                                        <td class="px-4 py-2 whitespace-nowrap"><span class="text-green-600 font-bold">YES</span></td>
                                        <td class="px-4 py-2">The message content. Max 160 characters.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <h4 class="text-lg font-semibold text-gray-700 mt-6 mb-2">Supported Number Formats</h4>
                        <ul class="list-disc list-inside text-gray-600 ml-4">
                            <li><code>09XXXXXXXXX</code> (e.g., 09123456789)</li>
                            <li><code>9XXXXXXXXX</code> (e.g., 9123456789 - 10 digits)</li>
                            <li><code>+639XXXXXXXXX</code> (e.g., +639123456789)</li>
                            <li><code>639XXXXXXXXX</code> (e.g., 639123456789)</li>
                        </ul>

                    </div>

                    <!-- Response -->
                    <div>
                        <h3 class="text-xl font-semibold text-gray-800 mb-3">Success Response (200 OK)</h3>
                        <div class="code-block !bg-green-800 text-green-200">
                            <pre>{
    "success": true,
    "message": "SMS sent successfully",
    "timestamp": "2025-12-11T17:20:21.000Z",
    "to": "+639123456789",
    "responseTime": "245ms",
    "metadata": {
        "senderName": "JhamesAPI",
        "messageLength": 45
    }
}</pre>
                        </div>

                        <h3 class="text-xl font-semibold text-gray-800 mt-6 mb-3">Error Responses</h3>

                        <h4 class="text-lg font-semibold text-gray-700 mb-2">400 Bad Request (Validation Failure)</h4>
                        <div class="code-block !bg-red-800 text-red-200">
                            <pre>{
    "success": false,
    "error": "Validation failed",
    "details": [
        "Phone number is required"
    ],
    "timestamp": "2025-12-11T17:20:21.000Z"
}</pre>
                        </div>

                        <h4 class="text-lg font-semibold text-gray-700 mt-4 mb-2">500 Internal Server Error (SMS Service Failure)</h4>
                        <div class="code-block !bg-red-800 text-red-200">
                            <pre>{
    "success": false,
    "error": "Failed to send SMS via external service",
    "message": "The upstream SMS service returned an error or unexpected response.",
    "timestamp": "2025-12-11T17:20:21.000Z",
    "responseTime": "500ms"
}</pre>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 3. Other Utility Endpoints -->
            <div class="bg-white p-8 rounded-xl shadow-lg">
                <h2 class="text-2xl font-semibold text-gray-900 section-header">Utility Endpoints</h2>

                <div class="grid md:grid-cols-2 gap-6">

                    <div class="border border-gray-200 p-6 rounded-lg bg-gray-50">
                        <div class="flex items-center space-x-4 mb-3">
                            <span class="method-badge get">GET</span>
                            <span class="path-display">/health</span>
                        </div>
                        <p class="text-gray-600 mb-3">Provides a lightweight check of the API's operational status and system uptime.</p>
                        <div class="code-block text-green-400">
                            <pre>{ "status": "OK", "uptime": 1234, ... }</pre>
                        </div>
                    </div>

                    <div class="border border-gray-200 p-6 rounded-lg bg-gray-50">
                        <div class="flex items-center space-x-4 mb-3">
                            <span class="method-badge get">GET</span>
                            <span class="path-display">/</span> /api
                        </div>
                        <p class="text-gray-600 mb-3">Root and `/api` endpoints return a brief manifest of the service, version, and primary routes.</p>
                        <div class="code-block text-blue-400">
                            <pre>{ "message": "SMS API Service", "documentation": "/api/docs", ... }</pre>
                        </div>
                    </div>

                </div>
            </div>

            <!-- 4. Code Examples -->
            <div class="bg-white p-8 rounded-xl shadow-lg">
                <h2 class="text-2xl font-semibold text-gray-900 section-header">Code Examples</h2>
                <p class="text-gray-600 mb-6">Easily integrate the <code>POST /send-sms</code> endpoint into your application using common technologies.</p>

                <!-- cURL Example -->
                <h3 class="text-xl font-semibold text-gray-800 mt-6 mb-3">cURL</h3>
                <div class="code-block relative">
                    <pre>curl -X POST "${baseUrl}/send-sms" \
\
-H "Content-Type: application/json" \
-d '{
    "number": "09123456789",
    "senderName": "JhamesClient",
    "message": "Testing cURL integration."
}'</pre>
                    <button class="copy-btn absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-3 rounded-md text-xs transition duration-150" onclick="copyCode(this)">Copy</button>
                </div>

                <!-- JavaScript Fetch Example -->
                <h3 class="text-xl font-semibold text-gray-800 mt-6 mb-3">JavaScript (Fetch)</h3>
                <div class="code-block relative">
                    <pre>const response = await fetch('${baseUrl}/send-sms', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        number: '09123456789',
        senderName: 'WebClient',
        message: 'Testing Fetch API.'
    })
});

const result = await response.json();
console.log(result);</pre>
                    <button class="copy-btn absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-3 rounded-md text-xs transition duration-150" onclick="copyCode(this)">Copy</button>
                </div>

                <!-- Python Example -->
                <h3 class="text-xl font-semibold text-gray-800 mt-6 mb-3">Python (Requests)</h3>
                <div class="code-block relative">
                    <pre>import requests
import json

url = "${baseUrl}/send-sms"
headers = {
    "Content-Type": "application/json"
}
data = {
    "number": "09123456789",
    "senderName": "PythonApp",
    "message": "Testing Python Requests."
}

response = requests.post(url, headers=headers, data=json.dumps(data))
result = response.json()
print(result)</pre>
                    <button class="copy-btn absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-3 rounded-md text-xs transition duration-150" onclick="copyCode(this)">Copy</button>
                </div>
            </div>

            <!-- 5. Security Summary -->
            <div class="bg-white p-8 rounded-xl shadow-lg">
                <h2 class="text-2xl font-semibold text-gray-900 section-header">Security & Reliability</h2>
                <p class="text-gray-600 mb-6">The API is built with robust security features to ensure stability and protect against misuse.</p>

                <div class="grid md:grid-cols-3 gap-6">
                    <div class="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                        <h4 class="font-bold text-blue-700 mb-2">Host & CORS Protection</h4>
                        <p class="text-sm text-gray-700">Access is restricted to pre-authorized domains (including localhost for development) to prevent unauthorized cloning.</p>
                    </div>
                    <div class="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                        <h4 class="font-bold text-yellow-700 mb-2">Rate Limiting</h4>
                        <p class="text-sm text-gray-700">Limits traffic to <strong>100 requests per 15 minutes</strong> per IP to ensure fair resource allocation.</p>
                        <code class="text-xs text-yellow-800 mt-2 block">X-RateLimit-Remaining: 99</code>
                    </div>
                    <div class="p-4 border border-green-200 bg-green-50 rounded-lg">
                        <h4 class="font-bold text-green-700 mb-2">Input Validation</h4>
                        <p class="text-sm text-gray-700">Strict validation on number format, message length (max 160 chars), and sender name (max 50 chars).</p>
                    </div>
                </div>
            </div>

            <!-- 6. Author & Contact -->
            <div class="bg-white p-8 rounded-xl shadow-lg border-t-4 border-indigo-500">
                <h2 class="text-2xl font-semibold text-gray-900 section-header">Author & Contact</h2>
                <div class="flex flex-col space-y-4 text-gray-700">
                    <p class="text-lg font-bold">Made by <span class="text-indigo-600">Jhames Martin</span></p>
                    <div class="grid sm:grid-cols-2 gap-4">
                        <div class="flex items-center space-x-3">
                            <!-- GitHub Icon -->
                            <svg class="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.865-.013-1.7c-2.782.602-3.369-1.341-3.369-1.341-.454-1.157-1.11-1.464-1.11-1.464-.908-.621.069-.608.069-.608 1.004.07 1.531 1.028 1.531 1.028.892 1.529 2.341 1.087 2.91.829.091-.643.352-1.087.641-1.334-2.223-.251-4.555-1.113-4.555-4.957 0-1.091.39-1.984 1.029-2.682-.103-.251-.446-1.268.098-2.646 0 0 .84-.268 2.75 1.026A9.558 9.558 0 0112 5.042c.85.004 1.705.116 2.515.337 1.91-1.294 2.75-1.026 2.75-1.026.542 1.378.199 2.395.096 2.646.64.698 1.028 1.591 1.028 2.682 0 3.854-2.333 4.702-4.564 4.954.357.307.675.915.675 1.848 0 1.333-.012 2.41-.012 2.748 0 .267.18.577.688.484C19.141 20.197 22 16.442 22 12.017 22 6.484 17.523 2 12 2z" clip-rule="evenodd" /></svg>
                            <a href="https://github.com/jrmph" target="_blank" class="text-indigo-600 hover:text-indigo-800 transition duration-150 font-medium">github.com/jrmph</a>
                        </div>
                        <div class="flex items-center space-x-3">
                            <!-- Facebook Icon -->
                            <svg class="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.656 9.126 8.432 9.873v-7.291H7.573V12h2.859V9.43c0-2.811 1.693-4.333 4.332-4.333 1.198 0 2.378.212 2.378.212v2.661h-1.353c-1.35 0-1.772.839-1.772 1.688V12h3.046l-.485 2.583h-2.561v7.29A10.043 10.043 0 0022 12z"/></svg>
                            <a href="https://www.facebook.com/jhames.rhonnielle.martin" target="_blank" class="text-indigo-600 hover:text-indigo-800 transition duration-150 font-medium">Facebook Profile</a>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </main>

    <!-- Footer -->
    <footer class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
        &copy; ${new Date().getFullYear()} SMS API Service by Jhames Martin. All Rights Reserved.
    </footer>
</div>

<script>
    function copyCode(button) {
        const code = button.previousElementSibling;
        // Use textContent to get the code snippet without HTML
        const text = code.textContent; 

        navigator.clipboard.writeText(text.trim()).then(() => {
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            button.classList.remove('bg-blue-500', 'hover:bg-blue-600');
            button.classList.add('bg-green-500', 'hover:bg-green-600');

            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('bg-green-500', 'hover:bg-green-600');
                button.classList.add('bg-blue-500', 'hover:bg-blue-600');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            button.textContent = 'Copy Failed';
            button.classList.remove('bg-blue-500', 'hover:bg-blue-600');
            button.classList.add('bg-red-500', 'hover:bg-red-600');
            setTimeout(() => {
                button.textContent = 'Copy';
                button.classList.remove('bg-red-500', 'hover:bg-red-600');
                button.classList.add('bg-blue-500', 'hover:bg-blue-600');
            }, 2000);
        });
    }
</script>

</body>
</html>
`;
}


// ============================================================================
// API ROUTES 
// ============================================================================


// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        features: {
            rateLimit: '100 requests per 15 minutes',
            cors: 'enabled',
            security: 'helmet enabled',
            authentication: 'public access'
        }
    });
});


// API info endpoint (returns JSON manifest)
app.get('/api', (req, res) => {
    res.json({
        name: 'SMS API Service',
        version: '1.0.0',
        description: 'Secure SMS API with CORS support and rate limiting',
        author: 'Jhames',
        endpoints: {
            health: 'GET /api/health',
            info: 'GET /api',
            sendSMS: 'POST /api/send-sms',
            docs: 'GET /api/docs'
        },
        authentication: {
            type: 'None',
            description: 'Public access - no authentication required'
        },
        rateLimit: {
            windowMs: 15 * 60 * 1000,
            maxRequests: 100
        }
    });
});


// Send SMS endpoint
app.post('/api/send-sms', async (req, res) => {
    const startTime = Date.now();
    try {
        // Validate input
        const errors = validateInput(req.body);
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors,
                timestamp: new Date().toISOString()
            });
        }


        const { number, senderName, message } = req.body;
        const normalizedNumber = normalizePhone(number);
        if (!normalizedNumber) {
            return res.status(400).json({
                success: false,
                error: 'Invalid phone number format',
                timestamp: new Date().toISOString()
            });
        }


        console.log(`[SMS] Sending to ${normalizedNumber} from ${senderName} (IP: ${req.ip})`);


        // Prepare SMS data (from original script - logic unchanged)
        const suffix = '-freed0m';
        const credits = '\n\nSent via Jrmapi';
        const withSuffix = message.endsWith(suffix) ? message : `${message} ${suffix}`;
        const finalText = `${withSuffix}${credits}`;


        const commandArray = [
            'free.text.sms',
            '421',
            normalizedNumber,
            '2207117BPG',
            'fuT8-dobSdyEFRuwiHrxiz:APA91bHNbeMP4HxJR-eBEAS0lf9fyBPg-HWWd21A9davPtqxmU-J-TTQWf28KXsWnnTnEAoriWq3TFG8Xdcp83C6GrwGka4sTd_6qnlqbfN4gP82YaTgvvg',
            finalText
        ];


        const data = qs.stringify({
            UID: randomUID(),
            humottaee: 'Processing',
            Email: randomGmail(),
            '$Oj0O%K7zi2j18E': JSON.stringify(commandArray),
            device_id: randomDeviceId(),
            Photo: 'https://lh3.googleusercontent.com/a/ACg8ocJyIdNL-vWOcm_v4Enq2PRZRcNaU_c8Xt0DJ1LNvmtKDiVQ-A=s96-c',
            Name: senderName
        });


        // Send SMS request
        const response = await axios.post(
            'https://sms.m2techtronix.com/v13/sms.php',
            data,
            {
                headers: headers,
                timeout: 15000,
                validateStatus: function (status) {
                    return status < 500; // Only throw on 5xx errors
                }
            }
        );


        const responseTime = Date.now() - startTime;


        if (response.data && (response.data.success === true || response.data.status === 'success')) {
            console.log(`[SMS] Successfully sent to ${normalizedNumber} in ${responseTime}ms`);
            res.json({
                success: true,
                message: 'SMS sent successfully',
                timestamp: new Date().toISOString(),
                to: normalizedNumber,
                responseTime: `${responseTime}ms`,
                metadata: {
                    senderName,
                    messageLength: message.length
                }
            });
        } else {
            // ENHANCED LOGGING FOR EXTERNAL SERVICE FAILURE
            console.error(`[SMS FAILED] Sending to ${normalizedNumber}. Status: ${response.status}. Response Data:`, response.data);
            
            res.status(500).json({
                success: false,
                error: 'Failed to send SMS via external service',
                message: 'The upstream SMS service returned an error or unexpected response.',
                timestamp: new Date().toISOString(),
                responseTime: `${responseTime}ms`,
                upstream_status: response.status,
            });
        }


    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('[SMS] Error sending SMS:', error.message);
        if (error.code === 'ECONNABORTED') {
            return res.status(408).json({
                success: false,
                error: 'Request timeout',
                message: 'SMS service request timed out',
                timestamp: new Date().toISOString(),
                responseTime: `${responseTime}ms`
            });
        }
        
        // Use the global error handler's default response structure
        res.status(500).json({
            error: 'Internal server error',
            message: 'An internal error occurred while processing the request.',
            timestamp: new Date().toISOString(),
            responseTime: `${responseTime}ms`
        });
    }

});


// API documentation endpoint (UI ENHANCED)
app.get('/api/docs', (req, res) => {
    const docs = generateDocsHtml(req);
    res.setHeader('Content-Type', 'text/html');
    res.send(docs);
});


// Root endpoint (Pangunahing Site/Index)
app.get('/', (req, res) => {
    // Nagse-serve ng HTML documentation sa root path
    const docs = generateDocsHtml(req);
    res.setHeader('Content-Type', 'text/html');
    res.send(docs);
});


// ============================================================================
// ERROR HANDLERS
// ============================================================================


// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: `The endpoint ${req.originalUrl} does not exist`,
        availableEndpoints: [
            'GET /',
            'GET /api',
            'GET /api/health',
            'POST /api/send-sms',
            'GET /api/docs'
        ],
        timestamp: new Date().toISOString()
    });
});


// Global error handler
app.use((error, req, res, next) => {
    console.error('[GLOBAL ERROR]', error);
    res.status(500).json({
        error: 'Internal server error',
        message: 'Something went wrong on our end',
        timestamp: new Date().toISOString()
    });
});


// ============================================================================
// SERVER STARTUP (ENHANCED LOGGING)
// ============================================================================


app.listen(PORT, () => {
    // Cleaner, more professional startup logging
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.HOST || 'localhost';

    console.log(`\n==============================================`);
    console.log(`🚀 SMS API Service v1.0.0 is running.`);
    console.log(`==============================================`);
    console.log(`\n🌐 Host: ${protocol}://${host}:${PORT}`);
    console.log(`📄 Docs (Index): ${protocol}://${host}:${PORT}/`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`\n🛡️ Active Security Features:`);
    console.log(` - Rate Limiting (100 req/15 min)`);
    console.log(` - CORS & Host Protection`);
    console.log(` - Input Validation`);
    console.log(`\nReady to accept requests.\n`);
});


module.exports = app;
