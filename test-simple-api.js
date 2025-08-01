const https = require('https');

const options = {
  hostname: 'aethoria-console-pu7ww5cj5-michaels-projects-19e37f0b.vercel.app',
  port: 443,
  path: '/api/test',
  method: 'GET'
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);

  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('Response:', responseData);
    try {
      const parsed = JSON.parse(responseData);
      console.log('Parsed response:', JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('Could not parse as JSON:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end(); 