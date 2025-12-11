const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration - only allow specific domains
const corsOptions = {
    origin: function (origin, callback) {
        // Define allowed hosts
        const allowedHosts = [
            'jrmph-freesmsapi-bvyo.onrender.com',
            'localhost:3000',
            '127.0.0.1:3000',
            'localhost',
            '127.0.0.1'
        ];
        
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Check if origin is allowed
        if (allowedHosts.includes(origin)) {
            return callback(null, true);
        }
        
        // Block unauthorized hosts
        callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

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

app.use('/api/', limiter);

// Parse JSON bodies
app.use(express.json());

// Host-based protection    },
    standard middleware
const hostProtection = (req, res, next) => {
    const allowedHosts = [
        'jrmph-freesmsapi-bvyo.onrender.com',
        'localhost:3000',
        '127.0.0.1:3000',
        'localhost',
        '127.0.0.1'
    ];
    
    const host = req.get('host');
    
    if (!allowedHosts.includes(host)) {
        return res.status(403).json({
            error: 'Access Denied',
            message: 'This API is only available from authorized domains.',
            yourHost: host,
            allowedHosts: ['jrmph-freesmsapi-bvyo.onrender.com']
        });
    }
    
    next();
};

// Apply host protection to API routes
app.use('/api/', hostProtection);

// Phone number validation and normalization
function validateAndNormalizePhoneNumber(phoneNumber) {
    if (!phoneNumber) return false;
    
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');
    
    // Philippine number patterns
    if (digits.startsWith('63') && digits.length === 12) {
        // Already in international format with country code
        return '+' + digits;
    } else if (digits.startsWith('0') && digits.length === 11) {
        // Local format (09xxxxxxxxx)
        return '+63' + digits.substring(1);
    } else if (digits.length === 10 && digits.startsWith('9')) {
        // Local format without leading 0 (9123456789)
        return '+63' + digits;
    }
    
    // Return false if doesn't match Philippine patterns
    return false;
}

// M2Tech SMS sending function
async function sendM2TechSMS(to, message, senderName) {
    try {
        const startTime = Date.now();
        
        // Normalize phone number
        const normalizedPhone = validateAndNormalizePhoneNumber(to);
        if (!normalizedPhone) {
            throw new Error('Invalid phone number format. Please use international format (+639123456789) or local format (09123456789).');
        }
        
        // Prepare M2Tech request
        const m2techData = {
            device_id: '2207117BPG',
            number: normalizedPhone,
            message: message,
            sender_name: senderName || 'FreeSMS'
        };
        
        console.log('Sending SMS via M2Tech:', m2techData);
        
        // Make request to M2Tech
        const response = await axios.post('https://sms.m2techtronix.com/v13/sms.php', m2techData, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000 // 10 seconds timeout
        });
        
        const responseTime = Date.now() - startTime;
        
        console.log('M2Tech Response:', response.data);
        
        // Check if SMS was sent successfully
        if (response.data && (response.data.status === 'success' || response.data.message || response.data.success)) {
            return {
                success: true,
                message: 'SMS sent successfully',
                timestamp: new Date().toISOString(),
                to: normalizedPhone,
                responseTime: `${responseTime}ms`,
                metadata: {
                    messageLength: message.length,
                    senderName: senderName || 'FreeSMS'
                }
            };
        } else {
            throw new Error(response.data?.message || response.data?.error || 'Unknown M2Tech error');
        }
        
    } catch (error) {
        console.error('M2Tech SMS Error:', error.message);
        
        // Handle different error types
        if (error.code === 'ECONNABORTED') {
            throw new Error('Request timeout - SMS service unavailable');
        } else if (error.response) {
            // M2Tech returned an error response
            throw new Error(error.response.data?.message || error.response.data?.error || 'M2Tech service error');
        } else if (error.request) {
            // Network error
            throw new Error('Network error - Cannot reach SMS service');
        } else {
            throw new Error(error.message);
        }
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0-m2tech',
        smsProvider: 'm2techtronix'
    });
});

// Main SMS sending endpoint
app.post('/api/send-sms', async (req, res) => {
    const startTime = Date.now();
    
    try {
        const { to, message, senderName } = req.body;
        
        // Input validation
        if (!to || !message) {
            return res.status(400).json({
                success: false,
                error: 'Invalid input',
                message: 'Both phone number and message are required'
            });
        }
        
        if (!senderName || senderName.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Sender name required',
                message: 'Sender name cannot be empty'
            });
        }
        
        // Validate message length
        if (message.length > 160) {
            return res.status(400).json({
                success: false,
                error: 'Message too long',
                message: 'Message must be 160 characters or less'
            });
        }
        
        console.log('SMS Request:', { to, message: message.substring(0, 50) + '...', senderName });
        
        // Send SMS via M2Tech
        const result = await sendM2TechSMS(to, message, senderName);
        
        // Log successful request
        console.log(`SMS sent successfully to ${result.to} in ${result.responseTime}`);
        
        res.json(result);
        
    } catch (error) {
        console.error('SMS Error:', error.message);
        
        // Return appropriate error response
        res.status(500).json({
            success: false,
            error: 'SMS sending failed',
            message: error.message,
            timestamp: new Date().toISOString(),
            responseTime: `${Date.now() - startTime}ms`
        });
    }
});

// Serve static files from public directory
app.use(express.static('public'));

// Root route - serve index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Docs route - serve docs.html
app.get('/docs', (req, res) => {
    res.sendFile(__dirname + '/public/docs.html');
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested endpoint does not exist'
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global Error:', error);
    
    res.status(500).json({
        error: 'Internal Server Error',
        message: 'Something went wrong'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 JRM FreeSMS API Server running on port ${PORT}`);
    console.log(`📱 SMS Provider: M2Tech Tronix`);
    console.log(`🔒 CORS enabled for: jrmph-freesmsapi-bvyo.onrender.com`);
    console.log(`⚡ Rate limit: 100 requests per 15 minutes`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;