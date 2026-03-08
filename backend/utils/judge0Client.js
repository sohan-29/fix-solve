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

// Normalize output for comparison
const normalizeOutput = (output) => {
  if (!output) return '';
  let result = output.toString().trim();
  result = result.replace(/(\r\n|\r|\n)+/g, '\n').trim();
  return result;
};

// Compare outputs with flexible matching
const compareOutputs = (actual, expected) => {
  const normActual = normalizeOutput(actual);
  const normExpected = normalizeOutput(expected);
  
  if (normActual === normExpected) return true;
  if (normActual.toLowerCase() === normExpected.toLowerCase()) return true;
  
  const a = normActual.replace(/\n$/, '');
  const e = normExpected.replace(/\n$/, '');
  if (a === e) return true;
  
  const aWords = a.split(/\s+/).filter(w => w.length > 0);
  const eWords = e.split(/\s+/).filter(w => w.length > 0);
  if (aWords.join(' ') === eWords.join(' ')) return true;
  
  return false;
};

// Execute Python - uses spawnSync for reliable stdin handling
const executePythonLocally = (sourceCode, stdin = '') => {
  const fs = require('fs');
  const path = require('path');
  const os = require('os');
  
  const tmpDir = path.join(os.tmpdir(), `python_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  try {
    fs.mkdirSync(tmpDir, { recursive: true });
    const srcFile = path.join(tmpDir, 'main.py');
    
    fs.writeFileSync(srcFile, sourceCode);
    
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    
    // Prepare stdin - ensure it ends with newline
    let stdinData = stdin;
    if (stdin && !stdin.endsWith('\n')) {
      stdinData = stdin + '\n';
    }
    
    const result = spawnSync(pythonCmd, [srcFile], {
      input: stdinData,
      timeout: 10000,
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024
    });
    
    return {
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      error: result.error || (result.status !== 0 ? new Error(result.stderr || 'Execution failed') : null)
    };
  } catch (error) {
    return { stdout: '', stderr: error.message, error };
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
  }
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
    
    let stdinData = stdin;
    if (stdin && !stdin.endsWith('\n')) {
      stdinData = stdin + '\n';
    }
    
    const runResult = spawnSync(outFile, [], {
      input: stdinData,
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
    
    let stdinData = stdin;
    if (stdin && !stdin.endsWith('\n')) {
      stdinData = stdin + '\n';
    }
    
    const runResult = spawnSync('java', ['-cp', tmpDir, className], {
      input: stdinData,
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

// Local execution - NOT async, uses synchronous spawnSync
const executeLocally = (sourceCode, language, stdin = '') => {
  switch (language.toLowerCase()) {
    case 'python':
      return executePythonLocally(sourceCode, stdin);
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
    const localResult = executeLocally(sourceCode, language, stdin);
    
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
    const localResult = executeLocally(sourceCode, language, stdin);
    
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
  
  for (let index = 0; index < testCases.length; index++) {
    const testCase = testCases[index];
    try {
      // Get the input - handle both string and object formats
      const input = typeof testCase === 'string' ? testCase : (testCase.input || '');
      const expectedOutput = typeof testCase === 'string' ? '' : (testCase.output || testCase.expected || '');
      
      // Call synchronous executeLocally directly (not await)
      const localResult = executeLocally(sourceCode, language, input);
      
      const actualOutput = localResult.stdout || '';
      const expected = expectedOutput || '';
      
      const isPassed = compareOutputs(actualOutput, expected);
      
      results.push({
        testCaseNumber: index + 1,
        input: input,
        expectedOutput: normalizeOutput(expected),
        actualOutput: normalizeOutput(actualOutput),
        status: localResult.error ? 'Runtime Error' : (isPassed ? 'Accepted' : 'Wrong Answer'),
        isPassed: isPassed,
        compile_output: localResult.stderr || ''
      });
    } catch (error) {
      results.push({
        testCaseNumber: index + 1,
        input: typeof testCase === 'string' ? testCase : (testCase.input || ''),
        expectedOutput: normalizeOutput(typeof testCase === 'string' ? '' : (testCase.output || testCase.expected || '')),
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
