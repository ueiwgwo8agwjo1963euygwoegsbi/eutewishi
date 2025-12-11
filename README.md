---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 30440220369233723bad8ae4400f6420d5a10b4a577e1170ec8382db1e798e78e5c3bb87022018132c4a85adea1aafe8926c8515923cd094598359ce468d1209d8e7804862e6
    ReservedCode2: 30450220481242d5088e2770c45c939f8aae0f944bc09a94922bcfd172b4db9d750f909c0221008231b7769da83dd95f9297632f0286e338c006e3946c2f86375533b06a5d31fe
---

# JRM FreeSMS API

Free SMS API service using M2Tech Tronix integration.

## Features

- 🚀 **Fast & Reliable** - Built on Express.js with M2Tech Tronix SMS service
- 🔒 **Secure** - Host-based protection, rate limiting, CORS enabled
- 📱 **Philippine Numbers** - Optimized for +63 phone number format
- ⚡ **Rate Limited** - 100 requests per 15 minutes per IP
- 🆓 **Completely Free** - No API keys or registration required

## API Endpoints

### Send SMS
```http
POST /api/send-sms
Content-Type: application/json

{
  "to": "+639123456789",
  "message": "Hello from FreeSMS API!",
  "senderName": "MyApp"
}
```

### Health Check
```http
GET /health
```

## Deployment on Render

1. **Fork/Clone this repository**
2. **Connect to Render:**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Use the provided `render.yml` configuration

3. **Environment Variables:**
   - `NODE_VERSION`: 18
   - `PORT`: 10000 (auto-assigned by Render)

4. **Domain Setup:**
   - Your service will be available at: `https://jrmph-freesmsapi-bvyo.onrender.com`
   - Update the `allowedHosts` array in `server.js` if using a different domain

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## Phone Number Formats

The API automatically normalizes Philippine phone numbers:
- `09123456789` → `+639123456789`
- `9123456789` → `+639123456789`
- `639123456789` → `+639123456789`
- `+639123456789` → `+639123456789`

## Rate Limiting

- **Limit:** 100 requests per 15 minutes per IP address
- **Headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Security

- **CORS:** Only allowed domains can access the API
- **Host Protection:** Prevents unauthorized hosting
- **Input Validation:** All inputs are validated and sanitized
- **Rate Limiting:** Prevents abuse and spam

## Author

Made by **Jhames Martin**
- GitHub: [@jrmph](https://github.com/jrmph)
- Facebook: [Jhames Rhonnielle Martin](https://www.facebook.com/jhames.rhonnielle.martin)

## License

MIT License - feel free to use this API for your projects!