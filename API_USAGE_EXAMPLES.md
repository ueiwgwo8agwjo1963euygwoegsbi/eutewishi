---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 304502202febdf6fc649a80952921ed6b5a175567a61ef61832044f6fafaac79cee83c52022100bd2ec23d35c9f4aae2ad81557b643984a56166629808ebd46c4780cbb0c8cc4f
    ReservedCode2: 3046022100bade01255be8c3893362785eeff5436aab3efc3bcbe8c213fa491ec4cce50e57022100a3b88e6f1e1910030b3d31561c34b92ff96becf733e5e1ed92168687e047b569
---

# JRM FreeSMS API - Usage Examples

## 🚀 Your API is Ready!

**API URL:** `https://jrmph-freesmsapi-bvyo.onrender.com`

## 📱 JavaScript/Node.js Usage

```javascript
// Send SMS using fetch
async function sendSMS(phoneNumber, message) {
    try {
        const response = await fetch('https://jrmph-freesmsapi-bvyo.onrender.com/api/send-sms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: phoneNumber,
                message: message
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ SMS sent successfully!');
            console.log('📱 To:', result.to);
            console.log('⏱️ Response time:', result.responseTime);
        } else {
            console.log('❌ Failed to send SMS:', result.error);
        }
        
        return result;
    } catch (error) {
        console.error('🚫 Error:', error.message);
    }
}

// Example usage
sendSMS('09123456789', 'Hello from JRM FreeSMS API!');

// Or with async/await
(async () => {
    const result = await sendSMS('09234567890', 'Test message');
})();
```

## 🌐 Browser Usage (HTML/JavaScript)

```html
<!DOCTYPE html>
<html>
<head>
    <title>SMS Test</title>
</head>
<body>
    <h1>SMS API Test</h1>
    
    <form id="smsForm">
        <input type="tel" id="phone" placeholder="Phone number" value="09123456789">
        <br><br>
        <textarea id="message" placeholder="Your message">Hello from browser!</textarea>
        <br><br>
        <button type="submit">Send SMS</button>
    </form>
    
    <div id="result"></div>

    <script>
        document.getElementById('smsForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const phone = document.getElementById('phone').value;
            const message = document.getElementById('message').value;
            const resultDiv = document.getElementById('result');
            
            resultDiv.innerHTML = '⏳ Sending SMS...';
            
            try {
                const response = await fetch('https://jrmph-freesmsapi-bvyo.onrender.com/api/send-sms', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ to: phone, message: message })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    resultDiv.innerHTML = `
                        <div style="color: green;">
                            ✅ SMS sent successfully!<br>
                            📱 To: ${result.to}<br>
                            ⏱️ Response time: ${result.responseTime}
                        </div>
                    `;
                } else {
                    resultDiv.innerHTML = `
                        <div style="color: red;">
                            ❌ Failed: ${result.error}<br>
                            💬 ${result.message}
                        </div>
                    `;
                }
            } catch (error) {
                resultDiv.innerHTML = `
                    <div style="color: red;">
                        🚫 Error: ${error.message}
                    </div>
                `;
            }
        });
    </script>
</body>
</html>
```

## 🐍 Python Usage

```python
import requests
import json

def send_sms(phone_number, message):
    url = 'https://jrmph-freesmsapi-bvyo.onrender.com/api/send-sms'
    
    data = {
        'to': phone_number,
        'message': message
    }
    
    try:
        response = requests.post(url, json=data)
        result = response.json()
        
        if result['success']:
            print('✅ SMS sent successfully!')
            print(f'📱 To: {result["to"]}')
            print(f'⏱️ Response time: {result["responseTime"]}')
        else:
            print(f'❌ Failed: {result["error"]}')
            print(f'💬 {result["message"]}')
            
        return result
        
    except Exception as e:
        print(f'🚫 Error: {str(e)}')

# Example usage
send_sms('09123456789', 'Hello from Python!')
```

## 📋 API Response Format

### Success Response
```json
{
    "success": true,
    "message": "SMS sent successfully",
    "timestamp": "2025-12-11T20:40:46.000Z",
    "to": "+639123456789",
    "responseTime": "1250ms",
    "metadata": {
        "messageLength": 25
    }
}
```

### Error Response
```json
{
    "success": false,
    "error": "Invalid phone number format",
    "message": "Please provide a valid Philippine phone number",
    "timestamp": "2025-12-11T20:40:46.000Z",
    "responseTime": "45ms"
}
```

## 🔧 Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api` | GET | API information |
| `/api/send-sms` | POST | Send SMS |
| `/docs` | GET | Documentation |
| `/` | GET | Landing page |

## 🛡️ Security Features

- ✅ **Host Protection:** Only your domain can access
- ✅ **Rate Limiting:** 100 requests per 15 minutes
- ✅ **Input Validation:** Phone numbers and messages validated
- ✅ **CORS Protection:** Cross-origin requests restricted
- ✅ **Security Headers:** Helmet.js protection

## 📞 Supported Phone Numbers

- Philippine numbers: `09123456789`, `+639123456789`, `639123456789`
- International format: `+1234567890`

**Author:** MiniMax Agent