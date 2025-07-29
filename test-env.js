console.log('Testing environment variables:');
console.log('OPENROUTER_API_KEY exists:', !!process.env.OPENROUTER_API_KEY);
console.log('OPENROUTER_API_KEY length:', process.env.OPENROUTER_API_KEY?.length || 0);
console.log('OPENROUTER_API_KEY prefix:', process.env.OPENROUTER_API_KEY?.substring(0, 10) || 'none');
console.log('All env vars with API:', Object.keys(process.env).filter(key => key.includes('API') || key.includes('ROUTER'))); 