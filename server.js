#!/usr/bin/env node

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const qs = require('qs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// HOST PROTECTION MIDDLEWARE - Prevents API cloning/scraping
// ============================================================================

// Allow localhost for development, but block other domains
const ALLOWED_HOSTS = [
    'jrmph-freesmsapi-bvyo.onrender.com',  // Your official Render domain
    'localhost:3000',              // Development
    'localhost',                   // Development
    '127.0.0.1:3000',             // Development
    '127.0.0.1'                   // Development
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
app.use(helmet());

// Rate limiting - 100 requests per 15 minutes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Try again later.',
        retryAfter: 900
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// CORS configuration - Only allow official domain
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [
        'https://jrmph-freesmsapi-bvyo.onrender.com',
        'http://localhost:3000',
        'http://localhost:8080'
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// ============================================================================
// STATIC FILE SERVING
// ============================================================================

// Serve static files from public directory
app.use(express.static('public'));

// Documentation routes
app.get('/api/docs', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'docs.html'));
});

app.get('/docs', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'docs.html'));
});

// Root route - serve landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

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
        /^(\+63|63|9)\d{9,10}$/,  // Philippine formats
        /^\+?[1-9]\d{1,14}$/      // General international format
    ];
    return patterns.some(pattern => pattern.test(number));
}

function normalizePhone(number) {
    if (!number) return null;
    
    // Remove all non-digit characters
    const digits = number.replace(/\D/g, '');
    
    // Handle Philippine numbers
    if (digits.startsWith('63')) {
        return '+63' + digits.substring(2);
    } else if (digits.startsWith('0')) {
        return '+63' + digits.substring(1);
    } else if (digits.length === 10 && digits.startsWith('9')) {
        return '+63' + digits.substring(1);
    }
    
    // For other international formats, add + if not present
    if (digits.length >= 10 && digits.length <= 15) {
        return number.startsWith('+') ? number : '+' + digits;
    }
    
    return null;
}

function validateInput(data) {
    const errors = [];
    
    if (!data.number || typeof data.number !== 'string') {
        errors.push('Phone number is required and must be a string');
    } else if (!validatePhoneNumber(data.number)) {
        errors.push('Please provide a valid Philippine phone number');
    }
    
    if (!data.message || typeof data.message !== 'string') {
        errors.push('Message is required and must be a string');
    } else if (data.message.length > 160) {
        errors.push('Message must be 160 characters or less');
    }
    
    return errors;
}

// ============================================================================
// SMS API HEADERS
// ============================================================================

const HEADERS = {
    'sec-ch-ua': '"Not)A;Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Accept': 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
    'Origin': 'https://www.teams灵.com',
    'Referer': 'https://www.teams灵.com/',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
};

// ============================================================================
// API ROUTES
// ============================================================================

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API info endpoint
app.get('/api', (req, res) => {
    res.json({
        name: 'JRM FreeSMS API',
        version: '1.0.0',
        description: 'Secure SMS API with host-based protection and rate limiting',
        author: 'Jhames Martin',
        endpoints: {
            health: 'GET /health',
            sendSms: 'POST /api/send-sms',
            info: 'GET /api',
            docs: 'GET /api/docs'
        },
        features: {
            rateLimit: '100 requests per 15 minutes per IP',
            cors: 'enabled for authorized domains',
            security: 'helmet enabled with security headers',
            authentication: 'host-based protection (no API key required)',
            inputValidation: 'phone numbers and messages validated'
        },
        allowedHosts: ALLOWED_HOSTS,
        documentation: `${req.protocol}://${req.get('host')}/docs`
    });
});

// Send SMS endpoint
app.post('/api/send-sms', async (req, res) => {
    const startTime = Date.now();

    try {
        // Check host protection (already handled by middleware)
        if (!ALLOWED_HOSTS.includes(req.get('host')) && 
            !ALLOWED_HOSTS.some(host => host.includes('localhost') && req.get('host').includes('localhost'))) {
            return res.status(403).json({
                error: 'Access Denied',
                message: 'This API is only available from authorized domains.',
                yourHost: req.get('host'),
                allowedHosts: ALLOWED_HOSTS.filter(h => !h.includes('localhost'))
            });
        }

        const { to, message } = req.body;
        const normalizedNumber = normalizePhone(to);
        
        if (!normalizedNumber) {
            return res.status(400).json({
                success: false,
                error: 'Invalid phone number format',
                message: 'Please provide a valid Philippine phone number',
                timestamp: new Date().toISOString(),
                responseTime: `${Date.now() - startTime}ms`
            });
        }

        if (!message || message.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Message required',
                message: 'Message content cannot be empty',
                timestamp: new Date().toISOString(),
                responseTime: `${Date.now() - startTime}ms`
            });
        }

        if (message.length > 160) {
            return res.status(400).json({
                success: false,
                error: 'Message too long',
                message: 'Message must be 160 characters or less',
                timestamp: new Date().toISOString(),
                responseTime: `${Date.now() - startTime}ms`
            });
        }

        console.log(`[SMS] Sending to ${normalizedNumber} from JRM FreeSMS API (IP: ${req.ip})`);

        // Prepare SMS data (from original script)
        const suffix = '-freed0m';
        const phoneWithSuffix = normalizedNumber + suffix;
        
        const smsData = qs.stringify({
            contacts: phoneWithSuffix,
            smsMessage: message,
            passwd: randomString(10) + '@',
            gadgets: randomString(8),
            lockcode: randomString(8),
            wap: randomString(8),
            mobile: randomString(10),
            email: randomGmail(),
            pid: randomString(10),
            rccpro: randomString(20),
            uids: randomString(20),
            utids: randomString(20),
            ccus: randomString(20),
            hash: randomString(30),
            mode: 'c',
            cc: 'PH',
            lc: 'en',
            scec: 'iso',
            pl: '3',
            pi: randomString(10),
            pd: randomGmail(),
            ps: randomString(15),
            pp: randomString(10),
            pt: '90',
            rtype: 'prepay',
            format: 'exec',
            t: randomString(20),
            api_hash: randomString(32)
        });

        const response = await axios.post('https://www.teams灵.com/ajax/send/sms/send', smsData, {
            headers: {
                ...HEADERS,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(smsData)
            },
            timeout: 30000
        });

        const responseTime = Date.now() - startTime;

        if (response.data && (response.data.success === true || response.data.status === 'success')) {
            console.log(`[SMS] ✅ Successfully sent to ${normalizedNumber}`);
            
            res.json({
                success: true,
                message: 'SMS sent successfully',
                timestamp: new Date().toISOString(),
                to: normalizedNumber,
                responseTime: `${responseTime}ms`,
                metadata: {
                    messageLength: message.length
                }
            });
        } else {
            console.warn(`[SMS] Failed to send to ${normalizedNumber}. Response:`, response.data);
            res.status(500).json({
                success: false,
                error: 'Failed to send SMS via external service',
                message: 'The upstream SMS service returned an error',
                timestamp: new Date().toISOString(),
                responseTime: `${responseTime}ms`,
                details: response.data
            });
        }

    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error('[SMS] Error sending SMS:', error.message);
        
        if (error.code === 'ECONNABORTED') {
            res.status(500).json({
                success: false,
                error: 'Request timeout',
                message: 'SMS service request timed out',
                timestamp: new Date().toISOString(),
                responseTime: `${responseTime}ms`
            });
        } else if (error.response) {
            res.status(500).json({
                success: false,
                error: 'External service error',
                message: 'SMS service returned an error',
                timestamp: new Date().toISOString(),
                responseTime: `${responseTime}ms`,
                serviceStatus: error.response.status
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: 'An error occurred while sending the SMS',
                timestamp: new Date().toISOString(),
                responseTime: `${responseTime}ms`
            });
        }
    }
});

// ============================================================================
// ERROR HANDLERS
// ============================================================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Endpoint ${req.method} ${req.path} not found`,
        availableEndpoints: [
            'GET /health',
            'GET /api',
            'POST /api/send-sms',
            'GET /api/docs'
        ]
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('[ERROR]', error);
    res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString()
    });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

app.listen(PORT, () => {
    console.log(`\n🚀 JRM FreeSMS API Server Started`);
    console.log(`================================`);
    console.log(`   Server:  http://localhost:${PORT}`);
    console.log(`   Health:  http://localhost:${PORT}/health`);
    console.log(`   API:     http://localhost:${PORT}/api`);
    console.log(`   Docs:    http://localhost:${PORT}/docs`);
    console.log(`   SMS:     http://localhost:${PORT}/api/send-sms`);
    console.log(`\n🔐 Security Features:`);
    console.log(`   ✅ Host Protection (Domain-based)`);
    console.log(`   ✅ Rate Limiting (100 requests/15min per IP)`);
    console.log(`   ✅ CORS Protection`);
    console.log(`   ✅ Input Validation`);
    console.log(`   ✅ Security Headers (Helmet.js)`);
    console.log(`\n📚 Documentation: http://localhost:${PORT}/docs`);
    console.log(`\n✅ Ready to use - No API key required!\n`);
});

module.exports = app;