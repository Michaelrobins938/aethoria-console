const https = require('https');

const apiKey = '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';

const data = JSON.stringify({
  model: 'openai/gpt-3.5-turbo',
  messages: [
    {
      role: 'user',
      content: 'Hello, this is a test message'
    }
  ],
  max_tokens: 100,
  temperature: 0.7
});

const options = {
  hostname: 'openrouter.ai',
  port: 443,
  path: '/api/v1/chat/completions',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://aethoria-console-aclts8oke-michaels-projects-19e37f0b.vercel.app',
    'X-Title': 'Aethoria Console'
  }
};

console.log('Testing OpenRouter API directly...');
console.log('API Key:', apiKey.substring(0, 20) + '...');
console.log('Headers:', options.headers);

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    try {
      const parsed = JSON.parse(data);
      console.log('Parsed response:', JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('Could not parse JSON response');
    }
  });
});

req.on('error', (e) => {
  console.error('Error:', e);
});

req.write(data);
req.end(); 