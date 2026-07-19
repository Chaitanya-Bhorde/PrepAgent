const http = require('http');

const testQuery = (query) => {
  return new Promise((resolve) => {
    const payload = JSON.stringify({ query });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/sql/execute',
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
        console.log('DEBUG RAW BODY:', body);
        resolve(JSON.parse(body));
      });
    });

    req.on('error', (err) => resolve({ success: false, error: err.message }));
    req.write(payload);
    req.end();
  });
};

const runTest = async () => {
  console.log('🧪 Starting SQLite compilation verification...');
  
  // Test 1: Simple SELECT with WHERE
  const res1 = await testQuery('SELECT * FROM employees WHERE salary > 65000;');
  console.log('\nTest 1 (SELECT + WHERE) Success:', res1.success);
  console.log('Returned rows:', res1.rows?.length);
  
  // Test 2: Table JOIN query
  const res2 = await testQuery('SELECT e.name, e.role, d.name AS dept_name FROM employees e JOIN departments d ON e.department_id = d.id;');
  console.log('\nTest 2 (Table JOIN) Success:', res2.success);
  console.log('Returned Columns:', res2.columns);
  console.log('Sample Row 1:', res2.rows?.[0]);

  // Test 3: SQL Syntax error validation
  const res3 = await testQuery('SELECT * FROM non_existing_table;');
  console.log('\nTest 3 (Error logs check) Success (should be false):', res3.success);
  console.log('Error output returned:', res3.error);
};

runTest();
