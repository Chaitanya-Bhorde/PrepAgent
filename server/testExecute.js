const http = require('http');

const postRequest = (url, data) => {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    
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
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(payload);
    req.end();
  });
};

const test = async () => {
  console.log('🧪 Starting Sandbox Execution Tests...');
  
  try {
    // Test 1: JavaScript normal code execution
    console.log('\n📝 Test 1: JavaScript Normal execution');
    const jsResult = await postRequest('http://localhost:5000/api/execute', {
      language: 'javascript',
      code: `console.log("Hello from JavaScript Docker sandbox!");`
    });
    console.log('Result:', jsResult);

    // Test 2: Python normal code execution
    console.log('\n📝 Test 2: Python Normal execution');
    const pyResult = await postRequest('http://localhost:5000/api/execute', {
      language: 'python',
      code: `print("Hello from Python Docker sandbox!")`
    });
    console.log('Result:', pyResult);

    // Test 3: JavaScript Infinite Loop (TLE check)
    console.log('\n📝 Test 3: Time Limit Exceeded (TLE) check');
    const tleResult = await postRequest('http://localhost:5000/api/execute', {
      language: 'javascript',
      code: `while(true) {}`
    });
    console.log('Result:', tleResult);

  } catch (error) {
    console.error('Test script failed:', error.message);
  }
};

test();
