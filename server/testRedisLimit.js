const http = require('http');

const runSandbox = () => {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      language: 'javascript',
      code: 'console.log("Limit Check");'
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/execute',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body
        });
      });
    });

    req.on('error', (err) => resolve({ statusCode: 500, error: err.message }));
    req.write(payload);
    req.end();
  });
};

const runTest = async () => {
  console.log('🧪 Starting Redis Rate Limiting Verification...');
  console.log('Hitting /api/execute 6 times in a row...');

  for (let i = 1; i <= 6; i++) {
    const result = await runSandbox();
    console.log(`\nHit ${i}: Status Code: ${result.statusCode}`);
    if (result.statusCode === 429) {
      console.log('✅ Success! Request blocked by Redis rate-limiter.');
      console.log('Response Body:', result.body);
    } else {
      console.log(`Remaining limit: ${result.headers['x-ratelimit-remaining']}`);
    }
  }
};

runTest();
