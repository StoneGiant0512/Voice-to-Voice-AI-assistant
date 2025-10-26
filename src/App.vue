<template>
  <div class="container">
    <h1 class="title">SentiVue</h1>
    <p class="subtitle">Your Voice AI Assistant</p>
    
    <div class="voice-controls">
      <div class="status">{{ status }}</div>
      
      <button 
        class="record-button"
        :class="{ recording: isRecording }"
        @click="toggleRecording"
        :disabled="isProcessing"
      >
        {{ isRecording ? '🛑' : '🎤' }}
      </button>
      
      <div v-if="isProcessing" class="loading">
        <div class="spinner"></div>
        Processing your request...
      </div>
    </div>

    <div v-if="conversation.length > 0" class="conversation">
      <div 
        v-for="(message, index) in conversation" 
        :key="index"
        class="message"
        :class="message.type"
      >
        <div class="message-label">{{ message.type === 'user' ? 'You' : 'AI Assistant' }}</div>
        <div class="message-content">{{ message.content }}</div>
      </div>
    </div>

    <div v-if="error" class="error">
      {{ error }}
    </div>

    <!-- Settings Button -->
    <button 
      @click="showSettings = true"
      class="settings-button"
    >
      ⚙️ Settings
    </button>

    <!-- Settings Modal -->
    <div v-if="showSettings" class="settings-modal" @click.self="showSettings = false">
      <div class="settings-content">
        <div class="settings-header">
          <h2>Configuration</h2>
          <button @click="showSettings = false" class="close-button">×</button>
        </div>
        
        <div class="settings-body">
          <div class="form-group">
            <label for="apiKey">Anthropic API Key</label>
            <input 
              id="apiKey"
              v-model="apiKey"
              type="password"
              placeholder="Enter your Anthropic API Key"
              class="api-key-input"
              :disabled="isUsingEnvKey"
            />
            <p class="help-text">
              <span v-if="isUsingEnvKey">
                🔒 Using API key from environment configuration. 
                To change it, update the VITE_ANTHROPIC_API_KEY in your .env file or config.js
              </span>
              <span v-else>
                Your API key is stored locally and never sent to our servers.
              </span>
            </p>
          </div>

          <div class="form-group">
            <label for="languageSelect">Language</label>
            <select 
              id="languageSelect"
              v-model="selectedLanguage"
              class="language-select"
              @change="saveLanguagePreference"
            >
              <option 
                v-for="(lang, code) in config.languages" 
                :key="code" 
                :value="code"
              >
                {{ lang.flag }} {{ lang.name }}
              </option>
            </select>
            <p class="help-text">
              Choose your preferred language for speech recognition and AI responses.
            </p>
          </div>

          <div class="form-group">
            <label for="voiceSelect">AI Voice</label>
            <select 
              id="voiceSelect"
              v-model="selectedVoice"
              class="voice-select"
              @change="saveVoicePreference"
            >
              <option value="female">👩 Female Voice</option>
              <option value="male">👨 Male Voice</option>
            </select>
            <p class="help-text">
              Choose the voice for AI responses. You can test different voices.
            </p>
          </div>

          <div class="form-actions">
            <button 
              @click="saveApiKey"
              class="save-button"
              :disabled="!apiKey.trim()"
            >
              💾 Save Configuration
            </button>
            
            <button 
              @click="testApiConnection"
              class="test-button"
              :disabled="!apiKey.trim()"
            >
              🔍 Test Connection
            </button>
            
            <button 
              @click="testVoice"
              class="test-voice-button"
            >
              🔊 Test Voice
            </button>
          </div>

          <div v-if="apiKeyStatus" class="api-status" :class="apiKeyStatus.type">
            {{ apiKeyStatus.message }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { config } from '../config.js'

export default {
  name: 'App',
  setup() {
    const isRecording = ref(false)
    const isProcessing = ref(false)
    const status = ref('Click the microphone to start')
    const conversation = ref([])
    const error = ref('')
    const apiKey = ref('')
    const showSettings = ref(false)
    const apiKeyStatus = ref(null)
    
    // Check if using environment variable
    const isUsingEnvKey = ref(false)
    
    // Voice selection
    const selectedVoice = ref('female')
    const availableVoices = ref([])
    
    // Language selection
    const selectedLanguage = ref('en-US')
    
    let recognition = null
    let mediaRecorder = null
    let audioChunks = []

    onMounted(() => {
      // Load API key from environment variable or localStorage
      const envApiKey = config.anthropicApiKey
      const savedApiKey = localStorage.getItem('anthropic-api-key')
      
      if (envApiKey && envApiKey !== 'your_anthropic_api_key_here') {
        // Use environment variable if set
        apiKey.value = envApiKey
        isUsingEnvKey.value = true
        apiKeyStatus.value = {
          type: 'success',
          message: 'Using API key from environment configuration'
        }
      } else if (savedApiKey) {
        // Fallback to localStorage
        apiKey.value = savedApiKey
        isUsingEnvKey.value = false
      }

      // Load voice preference
      const savedVoice = localStorage.getItem('selected-voice')
      if (savedVoice) {
        selectedVoice.value = savedVoice
      }

      // Load language preference
      const savedLanguage = localStorage.getItem('selected-language')
      if (savedLanguage) {
        selectedLanguage.value = savedLanguage
      }

      // Initialize voices
      initializeVoices()

      // Initialize speech recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        
        recognition.lang = selectedLanguage.value
        console.log('Speech recognition language set to:', selectedLanguage.value)

        recognition.onstart = () => {
          isRecording.value = true
          status.value = 'Listening... Speak now'
        }

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript
          status.value = 'Processing your message...'
          processUserInput(transcript)
        }

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          error.value = `Speech recognition error: ${event.error}`
          isRecording.value = false
          status.value = 'Click the microphone to start'
        }

        recognition.onend = () => {
          isRecording.value = false
          if (!isProcessing.value) {
            status.value = 'Click the microphone to start'
          }
        }
      } else {
        error.value = 'Speech recognition is not supported in this browser. Please use Chrome or Edge.'
      }
    })

    const toggleRecording = () => {
      if (isProcessing.value) return

      if (!apiKey.value) {
        error.value = 'Please enter your Anthropic API key first'
        return
      }

      if (isRecording.value) {
        recognition.stop()
      } else {
        error.value = ''
        recognition.start()
      }
    }

    const processUserInput = async (transcript) => {
      isProcessing.value = true
      
      // Add user message to conversation
      conversation.value.push({
        type: 'user',
        content: transcript
      })

      try {
        // Determine API URL based on environment
        const apiUrl = import.meta.env.DEV 
          ? '/api/v1/messages' 
          : 'https://api.anthropic.com/v1/messages'
        
        // Send to Anthropic Claude API
        const response = await axios.post(apiUrl, {
          model: config.anthropicModel,
          max_tokens: config.maxTokens,
          messages: [
            {
              role: 'user',
              content: transcript
            }
          ]
        }, {
          headers: {
            'x-api-key': apiKey.value,
            'Content-Type': 'application/json',
            'anthropic-version': config.anthropicVersion,
            'anthropic-dangerous-direct-browser-access': 'true'
          }
        })

        const aiResponse = response.data.content[0].text
        
        // Add AI response to conversation
        conversation.value.push({
          type: 'ai',
          content: aiResponse
        })

        // Convert AI response to speech
        await speakText(aiResponse)
        
        status.value = 'Click the microphone to start'
        
      } catch (err) {
        console.error('API Error:', err)
        console.error('Error details:', err.response?.data)
        
        if (err.response?.status === 401) {
          error.value = 'Invalid API key. Please check your Anthropic API key.'
        } else if (err.response?.status === 403) {
          error.value = 'API key does not have permission. Please check your Anthropic account.'
        } else if (err.response?.status === 429) {
          error.value = 'Rate limit exceeded. Please wait a moment and try again.'
        } else if (err.code === 'ERR_NETWORK') {
          error.value = 'Network error. Please check your internet connection.'
        } else {
          error.value = `API Error: ${err.response?.data?.error?.message || err.message}`
        }
        
        status.value = 'Click the microphone to start'
      } finally {
        isProcessing.value = false
      }
    }

    const initializeVoices = () => {
      if ('speechSynthesis' in window) {
        // Load voices when they become available
        const loadVoices = () => {
          availableVoices.value = speechSynthesis.getVoices()
          
          // Set default voices based on gender
          const voices = speechSynthesis.getVoices()
          
          // Find male voice (lower pitch, typically male names)
          const maleVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('male') ||
            voice.name.toLowerCase().includes('david') ||
            voice.name.toLowerCase().includes('alex') ||
            voice.name.toLowerCase().includes('daniel')
          ) || voices.find(voice => voice.name.includes('Google') && voice.name.includes('Male'))
          
          // Find female voice (higher pitch, typically female names)
          const femaleVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('female') ||
            voice.name.toLowerCase().includes('susan') ||
            voice.name.toLowerCase().includes('sarah') ||
            voice.name.toLowerCase().includes('emma')
          ) || voices.find(voice => voice.name.includes('Google') && voice.name.includes('Female'))
          
          // Set voices in config
          if (maleVoice) config.voices.male.voice = maleVoice
          if (femaleVoice) config.voices.female.voice = femaleVoice
        }
        
        // Load voices immediately if available
        loadVoices()
        
        // Also load when voices change
        speechSynthesis.addEventListener('voiceschanged', loadVoices)
      }
    }

    const speakText = (text) => {
      return new Promise((resolve) => {
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text)
          const voiceConfig = config.voices[selectedVoice.value]
          
          // Set voice properties
          utterance.rate = voiceConfig.rate
          utterance.pitch = voiceConfig.pitch
          utterance.volume = voiceConfig.volume
          
          // Set specific voice if available
          if (voiceConfig.voice) {
            utterance.voice = voiceConfig.voice
          }
          
          utterance.onend = () => resolve()
          utterance.onerror = () => resolve()
          
          speechSynthesis.speak(utterance)
        } else {
          resolve()
        }
      })
    }

    const saveVoicePreference = () => {
      localStorage.setItem('selected-voice', selectedVoice.value)
      apiKeyStatus.value = {
        type: 'success',
        message: `Voice changed to ${config.voices[selectedVoice.value].name}`
      }
      
      // Clear status after 3 seconds
      setTimeout(() => {
        apiKeyStatus.value = null
      }, 3000)
    }

    const testVoice = () => {
      // Get test message in the selected language
      const testMessages = {
        'en-US': 'Hello! This is a test of the selected voice. How does it sound?',
        'es-ES': '¡Hola! Esta es una prueba de la voz seleccionada. ¿Cómo suena?',
        'fr-FR': 'Bonjour! Ceci est un test de la voix sélectionnée. Comment ça sonne?',
        'pt-BR': 'Olá! Este é um teste da voz selecionada. Como soa?'
      }
      
      const testText = testMessages[selectedLanguage.value] || testMessages['en-US']
      speakText(testText)
    }

    const saveLanguagePreference = () => {
      localStorage.setItem('selected-language', selectedLanguage.value)
      
      // Update speech recognition language
      if (recognition) {
        recognition.lang = selectedLanguage.value
        console.log('Updated speech recognition language to:', selectedLanguage.value)
      }
      
      apiKeyStatus.value = {
        type: 'success',
        message: `Language changed to ${config.languages[selectedLanguage.value].name}`
      }
      
      // Clear status after 3 seconds
      setTimeout(() => {
        apiKeyStatus.value = null
      }, 3000)
    }

    const saveApiKey = () => {
      // If using environment key, just close the modal
      if (isUsingEnvKey.value) {
        apiKeyStatus.value = {
          type: 'success',
          message: 'Configuration saved successfully!'
        }
        setTimeout(() => {
          apiKeyStatus.value = null
          showSettings.value = false
        }, 1000)
        return
      }
      
      if (!apiKey.value.trim()) {
        apiKeyStatus.value = {
          type: 'error',
          message: 'Please enter a valid API key'
        }
        return
      }
      
      localStorage.setItem('anthropic-api-key', apiKey.value)
      apiKeyStatus.value = {
        type: 'success',
        message: 'Configuration saved successfully!'
      }
      
      // Close settings modal after a short delay
      setTimeout(() => {
        apiKeyStatus.value = null
        showSettings.value = false
      }, 500)
    }

    const testApiConnection = async () => {
      if (!apiKey.value.trim()) {
        apiKeyStatus.value = {
          type: 'error',
          message: 'Please enter your API key first'
        }
        return
      }

      apiKeyStatus.value = {
        type: 'info',
        message: 'Testing connection...'
      }

      try {
        // Determine API URL based on environment
        const apiUrl = import.meta.env.DEV 
          ? '/api/v1/messages' 
          : 'https://api.anthropic.com/v1/messages'
        
        const response = await axios.post(apiUrl, {
          model: config.anthropicModel,
          max_tokens: 10,
          messages: [
            {
              role: 'user',
              content: 'Hello'
            }
          ]
        }, {
          headers: {
            'x-api-key': apiKey.value,
            'Content-Type': 'application/json',
            'anthropic-version': config.anthropicVersion,
            'anthropic-dangerous-direct-browser-access': 'true'
          }
        })
        
        console.log('API test successful:', response.data)
        apiKeyStatus.value = {
          type: 'success',
          message: 'Connection successful! API key is working.'
        }
        
        // Clear status after 5 seconds
        setTimeout(() => {
          apiKeyStatus.value = null
        }, 5000)
        
        return true
      } catch (err) {
        console.error('API test failed:', err)
        apiKeyStatus.value = {
          type: 'error',
          message: `Connection failed: ${err.response?.data?.error?.message || err.message}`
        }
        return false
      }
    }

    return {
      isRecording,
      isProcessing,
      status,
      conversation,
      error,
      apiKey,
      showSettings,
      apiKeyStatus,
      isUsingEnvKey,
      selectedVoice,
      availableVoices,
      selectedLanguage,
      config,
      toggleRecording,
      saveApiKey,
      testApiConnection,
      saveVoicePreference,
      testVoice,
      saveLanguagePreference
    }
  }
}
</script>
