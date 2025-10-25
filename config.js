// Configuration file for SentiVue
// You can set your API key here or use environment variables

export const config = {
  // Anthropic API Key - set this to your actual API key
  // You can also set VITE_ANTHROPIC_API_KEY in your environment
  anthropicApiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || 'your_anthropic_api_key_here',
  
  // API Configuration
  anthropicModel: 'claude-3-haiku-20240307',
  maxTokens: 200,
  anthropicVersion: '2023-06-01',
  
  // Voice Configuration
  voices: {
    male: {
      name: 'Male Voice',
      voice: null, // Will be set dynamically
      rate: 0.9,
      pitch: 0.8,
      volume: 1.0
    },
    female: {
      name: 'Female Voice', 
      voice: null, // Will be set dynamically
      rate: 0.9,
      pitch: 1.2,
      volume: 1.0
    }
  },
  defaultVoice: 'female',
  
  // Language Configuration
  languages: {
    'en-US': { name: 'English', flag: '🇺🇸', code: 'en-US' },
    'es-ES': { name: 'Spanish', flag: '🇪🇸', code: 'es-ES' },
    'fr-FR': { name: 'French', flag: '🇫🇷', code: 'fr-FR' },
    'pt-BR': { name: 'Portuguese', flag: '🇧🇷', code: 'pt-BR' }
  },
  defaultLanguage: 'en-US'
}
