# AI Chat Frontend

A modern, responsive AI chatbot frontend built with Next.js, featuring Google authentication, file upload support, and real-time streaming responses.

## Features

- 🔐 **Google Authentication** - Secure login with NextAuth.js
- 💬 **Real-time Chat** - Streaming responses with Server-Sent Events (SSE)
- 📁 **File Upload** - Support for various file types (text, PDF, images, etc.)
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🌙 **Dark Mode Support** - Automatic dark/light theme detection
- ⚡ **TypeScript** - Full type safety and better developer experience
- 🎨 **Modern UI** - Clean, ChatGPT-like interface with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with Typography plugin
- **Authentication**: NextAuth.js with Google OAuth
- **Icons**: Heroicons
- **State Management**: React Hooks (useState, useCallback)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Google Cloud Console project for OAuth credentials

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd ai-chat-frontend
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```

3. **Configure Google OAuth:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized origins: `http://localhost:3000`
   - Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

4. **Update `.env.local` with your credentials:**
   ```env
   NEXTAUTH_SECRET=your-random-secret-string
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Backend Integration

The frontend is designed to work with a Python backend that supports:

### Chat API Endpoint
```
POST /api/chat
Content-Type: multipart/form-data

Body:
- message: string (required)
- file: File (optional)

Response: Server-Sent Events (SSE) stream
Content-Type: text/event-stream

Format:
data: [token]

data: [DONE]
```

### Example Backend Response
```
data: Hello
data: there!
data: How
data: can
data: I
data: help
data: you
data: today?

data: [DONE]
```

## Project Structure

```
src/
├── app/
│   ├── api/auth/[...nextauth]/
│   │   └── route.ts          # NextAuth configuration
│   ├── globals.css           # Global styles
│   ├── layout.tsx           # Root layout with providers
│   └── page.tsx             # Main chat page
├── components/
│   ├── ChatInput.tsx        # Message input with file upload
│   ├── ChatMessages.tsx     # Message display component
│   ├── Header.tsx           # Navigation with auth
│   └── Providers.tsx        # Session provider wrapper
├── hooks/
│   └── useChat.ts           # Chat logic and streaming
└── types/
    └── chat.ts              # TypeScript interfaces
```

## Key Components

### ChatInput
- Text input with auto-resize
- File upload with drag & drop support
- File type validation and size limits
- Send button with loading states

### ChatMessages
- Message bubbles with user/AI distinction
- File attachment indicators
- Streaming response animation
- Auto-scroll to latest message

### Header
- Google sign-in/sign-out
- User profile display
- Responsive design

### useChat Hook
- Message state management
- Streaming response handling
- File upload integration
- Error handling

## Customization

### Styling
The app uses Tailwind CSS for styling. Key customization points:

- **Colors**: Modify the color palette in `tailwind.config.ts`
- **Typography**: Adjust font settings in `layout.tsx`
- **Components**: Update component styles in individual files

### Authentication
To add more OAuth providers:

1. Install the provider package
2. Update `src/app/api/auth/[...nextauth]/route.ts`
3. Add environment variables
4. Update the sign-in button in `Header.tsx`

### File Upload
To modify file upload settings:

- **File types**: Update the `accept` attribute in `ChatInput.tsx`
- **Size limits**: Modify the size check in `handleFileChange`
- **Preview**: Customize the file preview UI

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXTAUTH_SECRET` | Random string for JWT encryption | Yes |
| `NEXTAUTH_URL` | Your app's URL | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `NEXT_PUBLIC_API_URL` | Backend API base URL | Yes |

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the GitHub issues
2. Review the documentation
3. Create a new issue with detailed information

---

Built with ❤️ using Next.js and modern web technologies.

