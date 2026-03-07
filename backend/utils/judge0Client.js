const axios = require('axios');
const { spawn, spawnSync } = require('child_process');

const JUDGE0_URL = process.env.JUDGE0_URL || 'http://localhost:2358';

// Language IDs for Judge0
const LANGUAGE_IDS = {
  c: 50,
  cpp: 54,
  java: 62,
  python: 71,
};

// Supported languages for local execution
const LOCAL_LANGUAGES = ['python', 'c', 'cpp', 'java'];

const getLanguageId = (language) => LANGUAGE_IDS[language.toLowerCase()] || null;

const isLanguageSupported = (language) => LOCAL_LANGUAGES.includes(language.toLowerCase());

// Normalize output for comparison - more flexible matching
const normalizeOutput = (output) => {
  if (!output) return '';
  // Remove leading/trailing whitespace, convert all whitespace to single spaces
  return output.toString().trim()
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n+/g, '\n')
    .trim();
};

// Compare outputs more flexibly
const compareOutputs = (actual, expected) => {
  const normActual = normalizeOutput(actual);
  const normExpected = normalizeOutput(expected);
  
  // Exact match
  if (normActual === normExpected) return true;
  
  // Handle numeric outputs (e.g., "8" vs "8\n")
  if (normActual === normExpected) return true;
  
  // Try with ignoring case for strings
  if (normActual.toLowerCase() === normExpected.toLowerCase()) return true;
  
  // Handle trailing newline differences
  const a = normActual.replace(/\n$/, '');
  const e = normExpected.replace(/\n$/, '');
  if (a === e) return true;
  
  return false;
};

// Execute Python locally
const executePythonLocally = (sourceCode, stdin = '') => {
  return new Promise((resolve) => {
    const python = spawn('python', ['-c', sourceCode], {
      timeout: 10000,
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024
    });
    
    let stdout = '';
    let stderr = '';
    
    python.stdout.on('data', (data) => { stdout += data; });
    python.stderr.on('data', (data) => { stderr += data; });
    
    python.on('close', (code) => {
      resolve({
        stdout,
        stderr,
        error: code !== 0 ? new Error(stderr || 'Execution failed') : null
      });
    });
    
    python.on('error', (error) => {
      resolve({ stdout: '', stderr: error.message, error });
    });
    
    if (stdin) {
      python.stdin.write(stdin);
      python.stdin.end();
    }
  });
};

// Execute C/C++ locally
const executeCLocally = (sourceCode, stdin = '', isCpp = false) => {
  const ext = isCpp ? 'cpp' : 'c';
  const compiler = isCpp ? 'g++' : 'gcc';
  const fs = require('fs');
  const path = require('path');
  const tmpDir = path.join(require('os').tmpdir(), `code_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  try {
    fs.mkdirSync(tmpDir, { recursive: true });
    const srcFile = path.join(tmpDir, `main.${ext}`);
    const outFile = path.join(tmpDir, 'main.exe');
    
    fs.writeFileSync(srcFile, sourceCode);
    
    const compileResult = spawnSync(compiler, [srcFile, '-o', outFile], {
      encoding: 'utf-8',
      timeout: 15000
    });
    
    if (compileResult.status !== 0) {
      return { stdout: '', stderr: compileResult.stderr || 'Compilation failed', error: new Error('Compilation failed') };
    }
    
    const runResult = spawnSync(outFile, [], {
      input: stdin,
      timeout: 10000,
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024
    });
    
    return {
      stdout: runResult.stdout || '',
      stderr: runResult.stderr || '',
      error: runResult.error
    };
  } catch (error) {
    return { stdout: '', stderr: error.message, error };
  } finally {
    try { require('fs').rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
  }
};

// Execute Java locally
const executeJavaLocally = (sourceCode, stdin = '') => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const classMatch = sourceCode.match(/public\s+class\s+(\w+)/);
    const className = classMatch ? classMatch[1] : 'Main';
    
    const tmpDir = path.join(require('os').tmpdir(), `java_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    fs.mkdirSync(tmpDir, { recursive: true });
    
    fs.writeFileSync(path.join(tmpDir, `${className}.java`), sourceCode);
    
    const compileResult = spawnSync('javac', [path.join(tmpDir, `${className}.java`)], {
      encoding: 'utf-8',
      timeout: 15000,
      cwd: tmpDir
    });
    
    if (compileResult.status !== 0) {
      return { stdout: '', stderr: compileResult.stderr || 'Compilation failed', error: new Error('Compilation failed') };
    }
    
    const runResult = spawnSync('java', ['-cp', tmpDir, className], {
      input: stdin,
      timeout: 10000,
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024
    });
    
    return {
      stdout: runResult.stdout || '',
      stderr: runResult.stderr || '',
      error: runResult.error
    };
  } catch (error) {
    return { stdout: '', stderr: error.message, error };
  } finally {
    try { require('fs').rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
  }
};

// Local execution
const executeLocally = async (sourceCode, language, stdin = '') => {
  switch (language.toLowerCase()) {
    case 'python':
      return await executePythonLocally(sourceCode, stdin);
    case 'c':
      return executeCLocally(sourceCode, stdin, false);
    case 'cpp':
      return executeCLocally(sourceCode, stdin, true);
    case 'java':
      return executeJavaLocally(sourceCode, stdin);
    default:
      return { stdout: '', stderr: `Language ${language} not supported`, error: new Error('Unsupported language') };
  }
};

// Check if Judge0 is available
const isJudge0Available = async () => {
  try {
    await axios.get(`${JUDGE0_URL}/languages`, { timeout: 2000 });
    return true;
  } catch (error) {
    return false;
  }
};

// Submit code to Judge0 or use local execution
const submitCode = async (sourceCode, language, stdin = '') => {
  if (!isLanguageSupported(language)) {
    return {
      status: { id: 6, description: 'Language Not Supported' },
      stdout: '',
      stderr: `Language ${language} is not supported`,
      compile_output: '',
      message: 'Language not supported'
    };
  }
  
  const languageId = getLanguageId(language);
  const judge0Available = await isJudge0Available();
  
  if (!judge0Available || !languageId) {
    const localResult = await executeLocally(sourceCode, language, stdin);
    
    return {
      status: { 
        id: localResult.error ? 6 : 3,
        description: localResult.error ? 'Runtime Error' : 'Accepted' 
      },
      stdout: localResult.stdout,
      stderr: localResult.stderr,
      compile_output: '',
      message: localResult.error ? `Error: ${localResult.stderr}` : 'Executed locally'
    };
  }
  
  try {
    const response = await axios.post(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
      source_code: sourceCode,
      language_id: languageId,
      stdin
    }, { timeout: 30000 });
    
    return response.data;
  } catch (error) {
    const localResult = await executeLocally(sourceCode, language, stdin);
    
    return {
      status: { 
        id: localResult.error ? 6 : 3,
        description: localResult.error ? 'Runtime Error' : 'Accepted' 
      },
      stdout: localResult.stdout,
      stderr: localResult.stderr,
      compile_output: '',
      message: localResult.error ? `Error: ${localResult.stderr}` : 'Executed locally (Judge0 unavailable)'
    };
  }
};

// Run all test cases
const runAllTestCases = async (sourceCode, language, testCases) => {
  const results = [];
  let judge0Warning = null;
  
  const judge0Available = await isJudge0Available();
  if (!judge0Available) {
    judge0Warning = 'Executed locally';
  }
  
  // Process test cases one by one (to avoid race conditions)
  for (let index = 0; index < testCases.length; index++) {
    const testCase = testCases[index];
    try {
      const localResult = await executeLocally(sourceCode, language, testCase.input);
      
      const actualOutput = localResult.stdout || '';
      const expectedOutput = testCase.output || '';
      
      const isPassed = compareOutputs(actualOutput, expectedOutput);
      
      results.push({
        testCaseNumber: index + 1,
        input: testCase.input,
        expectedOutput: normalizeOutput(expectedOutput),
        actualOutput: normalizeOutput(actualOutput),
        status: localResult.error ? 'Runtime Error' : (isPassed ? 'Accepted' : 'Wrong Answer'),
        isPassed: isPassed,
        compile_output: localResult.stderr || ''
      });
    } catch (error) {
      results.push({
        testCaseNumber: index + 1,
        input: testCase.input,
        expectedOutput: normalizeOutput(testCase.output || ''),
        actualOutput: `Error: ${error.message}`,
        status: 'Runtime Error',
        isPassed: false,
        compile_output: error.message
      });
    }
  }
  
  const passedCount = results.filter(r => r.isPassed).length;
  const allPassed = passedCount === testCases.length;
  
  return {
    results,
    summary: {
      total: testCases.length,
      passed: passedCount,
      failed: testCases.length - passedCount,
      allPassed,
      judge0Warning
    }
  };
};

// Quick single test case submission with validation
const submitAndValidate = async (sourceCode, language, input, expectedOutput) => {
  const result = await submitCode(sourceCode, language, input);
  const isPassed = compareOutputs(result.stdout || '', expectedOutput);
  
  return {
    result,
    isPassed,
    actualOutput: result.stdout || '',
    expectedOutput: expectedOutput
  };
};

module.exports = { 
  submitCode, 
  runAllTestCases, 
  submitAndValidate,
  getLanguageId,
  LANGUAGE_IDS,
  isJudge0Available,
  isLanguageSupported,
  normalizeOutput,
  compareOutputs
};
