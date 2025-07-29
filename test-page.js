const https = require('https');

const options = {
  hostname: 'aethoria-console-pu7ww5cj5-michaels-projects-19e37f0b.vercel.app',
  port: 443,
  path: '/api-test',
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
    console.log('Response length:', responseData.length);
    if (responseData.length > 1000) {
      console.log('Response (first 1000 chars):', responseData.substring(0, 1000));
    } else {
      console.log('Response:', responseData);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end(); 