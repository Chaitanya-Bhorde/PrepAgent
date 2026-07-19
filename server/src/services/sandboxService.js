/**
 * Execute code using Judge0 CE API
 * @param {string} code - The code to run
 * @param {string} language - The programming language
 * @param {string} stdin - Custom input for testing
 * @returns {Promise<Object>} - Execution result containing output, error, and status
 */
const executeCode = async (code, language, stdin = '') => {
  // Map language to Judge0 language IDs
  let languageId = 63; // Default: JavaScript (63)
  const lang = language.toLowerCase();
  
  if (lang === 'javascript' || lang === 'js') {
    languageId = 63;
  } else if (lang === 'python' || lang === 'py' || lang === 'python3') {
    languageId = 71;
  } else if (lang === 'java') {
    languageId = 62;
  } else if (lang === 'cpp' || lang === 'c++') {
    languageId = 54;
  }

  const startTime = Date.now();

  try {
    console.log(`📡 [Judge0 API] Sending submission for language ID ${languageId}...`);
    const response = await fetch('https://ce.judge0.com/submissions?base64_encoded=false&wait=true', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source_code: code,
        language_id: languageId,
        stdin: stdin
      })
    });

    if (!response.ok) {
      throw new Error(`Judge0 responded with status ${response.status}`);
    }

    const data = await response.json();
    console.log('📡 [Judge0 API] Received response:', data.status?.description);

    const success = data.status?.id === 3; // 3 = "Accepted"
    const executionTime = data.time ? Math.round(parseFloat(data.time) * 1000) : (Date.now() - startTime);

    return {
      success,
      output: data.stdout || '',
      error: data.stderr || data.compile_output || '',
      exitCode: data.status?.id || 0,
      executionTime,
      memory: data.memory || 0,
      statusDescription: data.status?.description || 'Unknown'
    };
  } catch (error) {
    console.error('❌ [Judge0 API] Error compiling code:', error.message);
    return {
      success: false,
      output: '',
      error: error.message,
      exitCode: -1,
      executionTime: Date.now() - startTime,
      memory: 0,
      statusDescription: 'Connection Error'
    };
  }
};

module.exports = { executeCode };
