# ChatGPT Clone - Setup Instructions

This is a mobile-first ChatGPT clone built with Next.js 15, tRPC, Bootstrap UI, Supabase, Auth0, and Google Gemini AI.

## ✅ Quick Start (Demo Mode)

The application works out of the box in **demo mode** with mock data! Just run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start chatting with the AI assistant (mock responses).

Visit [http://localhost:3000/debug](http://localhost:3000/debug) to see the development status.

## Features

-   📱 Mobile-first responsive design
-   💬 Text chat with Google Gemini AI
-   🎨 Image generation descriptions
-   💾 Persistent chat history with Supabase
-   🔐 Authentication with Auth0 (ready to implement)
-   ⚡ Real-time updates with tRPC
-   🎨 Bootstrap UI components
-   🛠️ **Demo mode with mock data** (works without any setup!)

## Development vs Production Mode

### Demo Mode (Current)

-   ✅ Works immediately without any configuration
-   ✅ Mock AI responses for testing
-   ✅ In-memory conversation storage
-   ✅ Perfect for development and testing

### Production Mode

-   ⚙️ Requires Supabase database setup
-   ⚙️ Requires Google Gemini AI API key
-   ⚙️ Requires Auth0 configuration (optional)
-   ⚙️ Persistent data storage
-   ⚙️ Real AI responsesne - Setup Instructions

This is a mobile-first ChatGPT clone built with Next.js 15, tRPC, Bootstrap UI, Supabase, Auth0, and Google Gemini AI.

## Features

-   📱 Mobile-first responsive design
-   💬 Text chat with Google Gemini AI
-   🎨 Image generation descriptions
-   💾 Persistent chat history with Supabase
-   🔐 Authentication with Auth0 (ready to implement)
-   ⚡ Real-time updates with tRPC
-   🎨 Bootstrap UI components

## Prerequisites

Before running this application, you need to set up the following services:

### 1. Supabase Database Setup

1. Go to [Supabase](https://supabase.com/) and create a new project
2. In the SQL Editor, run the following commands to create the required tables:

```sql
-- Create conversations table
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies (for demo purposes, allowing all operations)
-- In production, you should create more restrictive policies based on user authentication
CREATE POLICY "Allow all operations on conversations" ON conversations
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on messages" ON messages
  FOR ALL USING (true) WITH CHECK (true);
```

3. Get your Supabase URL and anon key from the project settings

### 2. Google Gemini AI Setup

1. Go to [Google AI Studio](https://ai.google.dev/)
2. Create a new API key
3. Copy the API key for use in environment variables

### 3. Auth0 Setup (Optional - Currently Disabled)

1. Go to [Auth0](https://auth0.com/) and create a new application
2. Choose "Regular Web Application"
3. Configure the allowed callback URLs, logout URLs, and web origins
4. Get your Domain, Client ID, and Client Secret

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Google Gemini AI Configuration
GOOGLE_GENERATIVE_AI_API_KEY=your-google-gemini-api-key

# Auth0 Configuration (Optional - Currently Disabled)
AUTH0_SECRET=your-auth0-secret-here
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret
```

## Installation

1. Clone the repository
2. Install dependencies:
    ```bash
    npm install
    ```
3. Set up your environment variables in `.env.local`
4. Run the development server:
    ```bash
    npm run dev
    ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Start a New Chat**: Click the "New Chat" button in the sidebar
2. **Switch Models**: Use the toggle buttons to switch between Text Chat and Image Generation modes
3. **Send Messages**: Type your message and press Enter or click the send button
4. **View History**: All your conversations are saved and can be accessed from the sidebar
5. **Delete Conversations**: Click the trash icon next to any conversation to delete it

## Mobile Experience

The application is designed mobile-first with:

-   Collapsible sidebar on mobile devices
-   Touch-friendly buttons and inputs
-   Responsive message bubbles
-   Optimized viewport for mobile screens

## Technical Stack

-   **Frontend**: Next.js 15 with App Router
-   **UI Framework**: Bootstrap 5
-   **State Management**: tRPC with TanStack Query
-   **Database**: Supabase (PostgreSQL)
-   **Authentication**: Auth0 (ready to implement)
-   **AI Integration**: Google Gemini AI
-   **Styling**: Bootstrap + Custom CSS

## API Endpoints

-   `/api/trpc/*` - tRPC API routes for all chat operations
-   `/auth/*` - Auth0 authentication routes (handled by middleware when enabled)

## Development

The project uses:

-   TypeScript for type safety
-   tRPC for end-to-end type safety
-   Zod for runtime validation
-   Superjson for data serialization
-   Auth0 SDK v4+ with middleware-based routing

## Auth0 V4 Integration

This project uses Auth0 v4+ which has a different setup than older versions:

-   ✅ **Middleware-based routing**: Auth routes are handled automatically by middleware
-   ✅ **No manual route handlers**: The old `handleAuth()` approach is no longer needed
-   ✅ **Simplified setup**: Just configure middleware and environment variables
-   📁 **Files**: `middleware.ts`, `src/lib/auth0.ts`, and environment variables

## Current Limitations

1. **Authentication**: Currently uses a mock user ID. Auth0 integration is ready and properly configured for v4, but disabled for easier setup.
2. **Image Generation**: Currently generates text descriptions. Full image generation would require additional implementation.
3. **Real-time**: Messages are not real-time between users (single-user application).

## Future Enhancements

-   [ ] Enable Auth0 authentication
-   [ ] Implement real image generation
-   [ ] Add real-time messaging between users
-   [ ] Add message search functionality
-   [ ] Add conversation sharing
-   [ ] Add dark/light theme toggle
-   [ ] Add voice input/output
-   [ ] Add file upload capabilities

## Troubleshooting

1. **Database Connection Issues**: Ensure your Supabase URL and keys are correct
2. **AI API Issues**: Verify your Google Gemini API key is valid and has sufficient quota
3. **Build Issues**: Make sure all environment variables are set correctly

## License

This project is for educational purposes. Please ensure you comply with the terms of service of all integrated services (Supabase, Google AI, Auth0).
