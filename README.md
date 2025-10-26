# SentiVue - Voice AI Assistant 🌍🎤

A modern voice-to-voice AI assistant platform built with Vue.js. Users can speak to the AI in multiple languages, get intelligent responses, and hear the AI's voice back.

[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=flat&logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-4.x-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![Anthropic](https://img.shields.io/badge/Anthropic-Claude-FF6B35?style=flat)](https://anthropic.com/)

## Features

- 🎤 **Voice Input**: Record your voice using the browser's speech recognition
- 🧠 **AI Processing**: Send your speech to Anthropic's Claude models for intelligent responses
- 🔊 **Voice Output**: Convert AI responses back to speech using text-to-speech
- 💬 **Conversation History**: See your conversation with the AI in real-time
- 🌍 **Multi-Language Support**: 4 languages including English, Spanish, French, and Portuguese
- 👥 **Voice Selection**: Choose between male and female AI voices
- 🔐 **Secure**: API keys stored locally, never sent to our servers
- 📱 **Responsive**: Works on desktop and mobile devices

## Live Demo
https://voice-to-voice-ai-assistant.vercel.app/

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/sentivue.git
cd sentivue
```

### 2. Install Dependencies

```bash
npm install
```

### 2. Configure API Key

You have two options for setting your Anthropic API key:

#### Option A: Environment Variable (Recommended)
1. Create a `.env` file in the project root
2. Add your API key:
   ```
   VITE_ANTHROPIC_API_KEY=your_actual_api_key_here
   ```
3. Or edit `config.js` and replace `your_anthropic_api_key_here` with your actual key

#### Option B: Get API Key from Anthropic
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and use it in Option A above

### 3. Run the Application

```bash
npm run dev
```

The application will open in your browser at `http://localhost:3000`

### 4. Start Using the App

1. If using environment variables, your API key is automatically loaded
2. If using localStorage, enter your API key in the settings section
3. Click the microphone to start talking to your AI assistant!

## How to Use

1. **Enter API Key**: First, enter your Anthropic API key in the settings
2. **Click Microphone**: Click the microphone button to start recording
3. **Speak**: Say something to the AI assistant
4. **Listen**: The AI will respond with both text and voice
5. **Continue**: Keep the conversation going!

## Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Edge
- ✅ Safari (limited support)
- ❌ Firefox (no speech recognition support)

## Technical Stack

- **Frontend**: Vue.js 3 with Composition API
- **Build Tool**: Vite
- **Styling**: Custom CSS with modern design
- **Voice Recognition**: Web Speech API
- **Text-to-Speech**: Speech Synthesis API
- **AI Integration**: Anthropic Claude-3 Haiku

## API Costs

This application uses Anthropic's API which has usage costs:
- Claude-3 Haiku: ~$0.25 per 1M input tokens, ~$1.25 per 1M output tokens
- Typical conversation: $0.01-0.05 per session

## Privacy & Security

- Your API key is stored locally in your browser
- No data is sent to our servers
- All communication is directly with Anthropic
- Voice data is processed by your browser and Anthropic only

## Troubleshooting

### Speech Recognition Not Working
- Make sure you're using Chrome or Edge
- Check that your microphone permissions are enabled
- Try refreshing the page

### API Errors
- Verify your Anthropic API key is correct
- Check that you have credits in your Anthropic account
- Ensure your API key has the necessary permissions

### No Voice Output
- Check your browser's audio settings
- Make sure your speakers/headphones are working
- Try refreshing the page

## Development

To modify or extend the application:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## License

MIT License - feel free to use and modify as needed!
