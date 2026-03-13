const axios = require('axios');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const JUDGE0_URL = process.env.JUDGE0_URL || 'http://localhost:2358';

// Language IDs for Judge0
const LANGUAGE_IDS = {
  c: 50,
  cpp: 54,
  java: 62,
  python: 71,
};

const SUPPORTED_LANGUAGES = ['python', 'c', 'cpp', 'java'];



const getLanguageId = (language) => LANGUAGE_IDS[language.toLowerCase()] || null;

const isLanguageSupported = (language) => SUPPORTED_LANGUAGES.includes(language.toLowerCase());



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

// Wrap code for Judge0 based on language - minimal wrapping only if needed
const wrapCode = (sourceCode, language) => {
  const lang = language.toLowerCase();
  if (lang === 'java') {
    // If code already has a main method, just ensure class is named Main
    if (sourceCode.includes('public static void main')) {
      // Rename any public class to Main for Judge0/local exec compatibility
      return sourceCode.replace(/public\s+class\s+\w+/, 'public class Main');
    }
    // Otherwise wrap in Main class
    return `import java.util.*;
public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    ${sourceCode.trim()}
  }
}`;
  } else if (lang === 'python') {
    // Python needs no wrapping - return as-is
    return sourceCode;
  } else if (lang === 'c' || lang === 'cpp') {
    if (sourceCode.includes('main(') || sourceCode.includes('main (')) {
      return sourceCode;
    }
    return `${sourceCode}

int main() {
  return 0;
}`;
  }
  return sourceCode;
};

// Execute Python locally
const executePythonLocally = (sourceCode, stdin = '') => {
  
  const tmpDir = path.join(os.tmpdir(), `python_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  
  try {
    fs.mkdirSync(tmpDir, { recursive: true });
    const srcFile = path.join(tmpDir, 'main.py');
    
    // Write the code directly - it already has main function
    fs.writeFileSync(srcFile, sourceCode);
    
// Find python executable
let pythonCmd;
if (process.platform === 'win32') {
  const whereResult = spawnSync('where', ['python'], { shell: true });
  if (whereResult.status === 0) {
    const found = whereResult.stdout.toString().split('\n')[0].trim();
    if (!found.includes('WindowsApps')) {
      pythonCmd = found;
    } else {
      // Alias found, use real path
      pythonCmd = 'C:\\Users\\' + require('os').userInfo().username + '\\AppData\\Local\\Programs\\Python\\Python311\\python.exe';
    }
  } else {
    // Fallback to known path
    pythonCmd = 'C:\\Users\\' + require('os').userInfo().username + '\\AppData\\Local\\Programs\\Python\\Python311\\python.exe';
  }
} else {
  pythonCmd = 'python3';
}

    
    // Prepare stdin - ensure it ends with newline
    let stdinData = stdin;
    if (stdin && !stdin.endsWith('\n')) {
      stdinData = stdin + '\n';
    }
    
    const result = spawnSync(pythonCmd, [srcFile], {
      input: stdinData,
      timeout: 10000,
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024 * 10,
      shell: true
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
  const tmpDir = path.join(os.tmpdir(), `code_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  try {
    fs.mkdirSync(tmpDir, { recursive: true });
    const srcFile = path.join(tmpDir, `main.${ext}`);
    const outFile = path.join(tmpDir, 'main.exe');
    
    // Write the code directly - it already has main function
    fs.writeFileSync(srcFile, sourceCode);
    
    const compileResult = spawnSync(compiler, [srcFile, '-o', outFile], {
      encoding: 'utf-8',
      timeout: 15000,
      shell: true
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
      maxBuffer: 1024 * 1024 * 10,
      shell: true
    });
    
    return {
      stdout: runResult.stdout || '',
      stderr: runResult.stderr || '',
      error: runResult.error
    };
  } catch (error) {
    return { stdout: '', stderr: error.message, error };
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
  }
};

// Execute Java locally
const executeJavaLocally = (sourceCode, stdin = '') => {
  
  try {
    // The code already has the Main class with main method
    const classMatch = sourceCode.match(/public\s+class\s+(\w+)/);
    const className = classMatch ? classMatch[1] : 'Main';
    
    const tmpDir = path.join(os.tmpdir(), `java_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    fs.mkdirSync(tmpDir, { recursive: true });
    
    fs.writeFileSync(path.join(tmpDir, `${className}.java`), sourceCode);
    
    // Simple execution relying on PATH (like C++ and Python)
    const javacCmd = 'javac';
    const javaCmd = 'java';
    
    const compileResult = spawnSync(javacCmd, [path.join(tmpDir, `${className}.java`)], {
      encoding: 'utf-8',
      timeout: 15000,
      cwd: tmpDir,
      shell: process.platform === 'win32' // Use shell on Windows for PATH resolution
    });
    
    if (compileResult.status !== 0) {
      return { stdout: '', stderr: compileResult.stderr || 'Compilation failed', error: new Error('Compilation failed') };
    }
    
    let stdinData = stdin;
    if (stdin && !stdin.endsWith('\n')) {
      stdinData = stdin + '\n';
    }
    
    const runResult = spawnSync(javaCmd, ['-cp', tmpDir, className], {
      input: stdinData,
      timeout: 10000,
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024 * 10,
      shell: process.platform === 'win32'
    });
    
    return {
      stdout: runResult.stdout || '',
      stderr: runResult.stderr || '',
      error: runResult.error
    };
  } catch (error) {
    return { stdout: '', stderr: error.message, error };
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
  }
};

// Local execution - uses synchronous spawnSync
const executeLocally = (sourceCode, language, stdin = '') => {
  const wrappedCode = wrapCode(sourceCode, language);
  switch (language.toLowerCase()) {
    case 'python':
      return executePythonLocally(wrappedCode, stdin);
    case 'c':
      return executeCLocally(wrappedCode, stdin, false);
    case 'cpp':
      return executeCLocally(wrappedCode, stdin, true);
    case 'java':
      return executeJavaLocally(wrappedCode, stdin);
    default:
      return { stdout: '', stderr: `Language ${language} not supported`, error: new Error('Unsupported language') };
  }
};

// Check if Judge0 is available
const isJudge0Available = async () => {
  try {
    await axios.get(`${JUDGE0_URL}/languages`, { timeout: 5000 });
    return true;
  } catch (error) {
    console.log('Judge0 not available:', error.message);
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
  if (!languageId) {
    return {
      status: { id: 6, description: 'Language Not Supported' },
      stdout: '',
      stderr: `Language ${language} not supported by Judge0`,
      compile_output: '',
      message: 'Language not supported by Judge0'
    };
  }
  
  try {
    const wrappedCode = wrapCode(sourceCode, language);
    const response = await axios.post(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true&cpu_time_limit=5&memory_limit=128000&cpu_cores=1`, {
      source_code: wrappedCode,
      language_id: languageId,
      stdin
    }, { timeout: 30000 });
    
    console.log('Judge0 response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Judge0 error:', error.message);
    return {
      status: { 
        id: 13,
        description: 'Judge0 Service Unavailable' 
      },
      stdout: '',
      stderr: error.message,
      compile_output: '',
      message: 'Judge0 service unavailable - check docker-compose'
    };
  }
};


// Run all test cases - Judge0 first, local fallback
const runAllTestCases = async (sourceCode, language, testCases) => {
  const results = [];
  
  if (!testCases?.length) {
    return { results: [], summary: { total: 0, passed: 0, failed: 0, allPassed: false } };
  }
  
  const judge0Available = await isJudge0Available();
  console.log(`Judge0 ${judge0Available ? 'available' : 'unavailable'}`);
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const input = typeof testCase === 'string' ? testCase : (testCase.input || '');
    const expected = typeof testCase === 'string' ? '' : (testCase.output || testCase.expected || '');
    
    let executionResult;
    
    if (judge0Available) {
      executionResult = await submitCode(sourceCode, language, input);
    } else {
      executionResult = executeLocally(sourceCode, language, input);
      executionResult.status = { id: executionResult.error ? 11 : 3, description: executionResult.error ? 'Runtime Error' : 'Accepted' };
      executionResult.time = 'local';
      executionResult.memory = 'local';
    }
    
    const actual = executionResult.stdout || '';
    const passed = compareOutputs(actual, expected);
    
    results.push({
      testCaseNumber: i + 1,
      input,
      expectedOutput: normalizeOutput(expected),
      actualOutput: normalizeOutput(actual),
      status: executionResult.status?.description || 'Error',
      isPassed: passed
    });
  }
  
  const passedCount = results.filter(r => r.isPassed).length;
  
  return {
    results,
    summary: {
      total: testCases.length,
      passed: passedCount,
      failed: testCases.length - passedCount,
      allPassed: passedCount === testCases.length
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
  executeLocally,
  getLanguageId,
  LANGUAGE_IDS,
  normalizeOutput,
  compareOutputs
};

