# Quick Setup Guide

## 1. Environment Setup

Copy the environment template and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your values:

```env
# Generate a random secret (you can use: openssl rand -base64 32)
NEXTAUTH_SECRET=your-random-secret-here

# Your app URL (use http://localhost:3000 for development)
NEXTAUTH_URL=http://localhost:3000

# Google OAuth credentials (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Your Python backend URL
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Go to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Choose "Web application"
6. Add these URLs:
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`
7. Copy the Client ID and Client Secret to your `.env.local`

## 3. Start Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 4. Backend Integration

Your Python backend should implement:

### Chat Endpoint
```python
@app.route('/api/chat', methods=['POST'])
def chat():
    # Get message and optional file from request
    message = request.form.get('message')
    file = request.files.get('file')
    
    # Return streaming response
    def generate():
        # Your AI logic here
        for token in ai_response:
            yield f"data: {token}\n\n"
        yield "data: [DONE]\n\n"
    
    return Response(generate(), mimetype='text/event-stream')
```

### CORS Configuration
```python
from flask_cors import CORS
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
```

## Features Included

✅ Google Authentication  
✅ Real-time streaming chat  
✅ File upload support  
✅ Responsive design  
✅ Dark mode support  
✅ TypeScript  
✅ Error handling  

## File Upload Support

Supported file types:
- Text files (.txt)
- PDFs (.pdf)
- Word documents (.doc, .docx)
- Images (.png, .jpg, .jpeg, .gif)
- Data files (.csv, .json)

Max file size: 10MB

## Troubleshooting

### Authentication Issues
- Verify Google OAuth credentials
- Check authorized URLs in Google Console
- Ensure NEXTAUTH_SECRET is set

### Streaming Issues
- Verify backend CORS configuration
- Check NEXT_PUBLIC_API_URL is correct
- Ensure backend returns proper SSE format

### Build Issues
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

