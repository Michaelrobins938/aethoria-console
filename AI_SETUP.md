# 🤖 AI Setup Guide for Aethoria Console

## Quick Start - Get AI Working in 5 Minutes

### Option 1: OpenAI (Recommended - Easiest)

1. **Get OpenAI API Key**
   - Go to https://platform.openai.com/api-keys
   - Sign up/login to OpenAI
   - Click "Create new secret key"
   - Copy the key (starts with `sk-`)

2. **Add to Environment**
   - Create a `.env.local` file in your project root
   - Add: `OPENAI_API_KEY=your_key_here`
   - Replace `your_key_here` with your actual API key

3. **Deploy to Vercel**
   - Add the environment variable in Vercel dashboard
   - Go to your project settings → Environment Variables
   - Add `OPENAI_API_KEY` with your key

### Option 2: OpenRouter (Free Tier Available)

1. **Get OpenRouter API Key**
   - Go to https://openrouter.ai/
   - Sign up for free account
   - Get your API key from dashboard

2. **Add to Environment**
   - Create a `.env.local` file in your project root
   - Add: `OPENROUTER_API_KEY=your_key_here`

3. **Deploy to Vercel**
   - Add the environment variable in Vercel dashboard
   - Go to your project settings → Environment Variables
   - Add `OPENROUTER_API_KEY` with your key

## How It Works

The AI system now supports multiple providers:

1. **OpenRouter** (tries first if key available)
2. **OpenAI** (tries second if key available)
3. **Fallback** (works without any API key for testing)

## Testing

- The AI will work immediately with fallback responses
- Add an API key to get full AI functionality
- Check the browser console for debug information

## Troubleshooting

- **No AI responses**: Check that your API key is correct
- **Rate limits**: OpenRouter has generous free tier
- **Environment variables**: Make sure they're set in Vercel dashboard

## Features

✅ **Multi-provider support** - Works with OpenAI or OpenRouter  
✅ **Fallback system** - Always works, even without API keys  
✅ **Game context awareness** - AI knows about your character and game  
✅ **Mobile optimized** - Works great on phones and tablets  
✅ **Voice support** - Text-to-speech and speech-to-text ready