const axios = require('axios');
const { spawn, spawnSync } = require('child_process');
const vm = require('vm');

const JUDGE0_URL = process.env.JUDGE0_URL || 'http://localhost:2358';

// Language IDs for Judge0 - Only supported languages
const LANGUAGE_IDS = {
  c: 50,
  cpp: 54,
  java: 62,
  python: 71,
};

// Supported languages for local execution
const LOCAL_LANGUAGES = ['python', 'c', 'cpp', 'java'];

// Get language ID from language name
const getLanguageId = (language) => {
  return LANGUAGE_IDS[language.toLowerCase()] || null;
};

// Check if language is supported
const isLanguageSupported = (language) => {
  return LOCAL_LANGUAGES.includes(language.toLowerCase());
};

// Check if code already has main function (runnable)
const hasMainFunction = (code, language) => {
  const lang = language.toLowerCase();
  
  switch (lang) {
    case 'c':
    case 'cpp':
      return /int\s+main\s*\(/.test(code) || /void\s+main\s*\(/.test(code);
    case 'java':
      return /public\s+static\s+void\s+main\s*\(/.test(code);
    case 'python':
      return code.includes('if __name__') || /def\s+main\s*\(/.test(code);
    default:
      return false;
  }
};

// Extract function name from code - supports various function patterns
const extractFunctionName = (code, language) => {
  const lang = language.toLowerCase();
  
  switch (lang) {
    case 'c':
    case 'cpp': {
      // Match returnType functionName(params) - more flexible pattern
      const match = code.match(/(?:int|long|long long|void|double|float|char|bool|string)\s+(\w+)\s*\([^)]*\)\s*\{/);
      return match ? match[1] : null;
    }
    case 'java': {
      // Match public static returnType functionName(params)
      const match = code.match(/(?:public\s+static\s+)?(?:int|long|double|float|char|boolean|String|void)\s+(\w+)\s*\([^)]*\)\s*\{/);
      return match ? match[1] : null;
    }
    case 'python': {
      // Match def functionName( - flexible pattern
      const match = code.match(/def\s+(\w+)\s*\(/);
      return match ? match[1] : null;
    }
    default:
      return null;
  }
};

// Parse input and return as array of values
const parseInput = (input) => {
  if (!input || input.trim() === '') return [];
  
  // Split by whitespace and newlines
  const values = input.trim().split(/[\s\n]+/);
  
  // Try to parse as numbers, keep strings if not valid numbers
  return values.map(v => {
    const num = parseFloat(v);
    return isNaN(num) ? v : num;
  });
};

// Wrap function code with main for C
const wrapCCode = (code, functionName, inputValues) => {
  if (hasMainFunction(code, 'c')) return code;
  
  const returnTypeMatch = code.match(/(int|long|long long|double|float|void|string)\s+\w+\s*\(/);
  const returnType = returnTypeMatch ? returnTypeMatch[1] : 'int';
  
  let mainCode = '';
  
  if (returnType === 'void') {
    
    if (inputValues.length === 0) {
      mainCode = `
int main() {
    ${functionName}();
    return 0;
}`;
    } else if (inputValues.length === 1) {
      mainCode = `
int main() {
    int a;
    scanf("%d", &a);
    ${functionName}(a);
    return 0;
}`;
    } else if (inputValues.length === 2) {
      mainCode = `
int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    ${functionName}(a, b);
    return 0;
}`;
    } else {
      mainCode = `
int main() {
    int n = ${inputValues.length};
    int arr[${inputValues.length}];
    for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
    ${functionName}(arr, n);
    return 0;
}`;
    }
  } else {
    if (inputValues.length === 0) {
      mainCode = `
int main() {
    ${returnType.includes('long') ? 'long long' : 'int'} result = ${functionName}();
    printf("%lld", result);
    return 0;
}`;
    } else if (inputValues.length === 1) {
      mainCode = `
int main() {
    int a;
    scanf("%d", &a);
    ${returnType.includes('long') ? 'long long' : 'int'} result = ${functionName}(a);
    printf("%lld", result);
    return 0;
}`;
    } else if (inputValues.length === 2) {
      mainCode = `
int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    ${returnType.includes('long') ? 'long long' : 'int'} result = ${functionName}(a, b);
    printf("%lld", result);
    return 0;
}`;
    } else {
      mainCode = `
int main() {
    int n = ${inputValues.length};
    int arr[${inputValues.length}];
    for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
    ${returnType.includes('long') ? 'long long' : 'int'} result = ${functionName}(arr, n);
    printf("%lld", result);
    return 0;
}`;
    }
  }
  
  let wrappedCode = code;
  if (!code.includes('#include')) {
    wrappedCode = '#include <stdio.h>\n' + wrappedCode;
  }
  
  return wrappedCode + mainCode;
};

// Wrap function code with main for C++
const wrapCppCode = (code, functionName, inputValues) => {
  if (hasMainFunction(code, 'cpp')) return code;
  
  const returnTypeMatch = code.match(/(int|long|long long|double|float|void|char|bool|string)\s+\w+\s*\(/);
  const returnType = returnTypeMatch ? returnTypeMatch[1] : 'int';
  
  let mainCode = '';
  
  if (returnType === 'void') {
    if (inputValues.length === 0) {
      mainCode = `
int main() {
    ${functionName}();
    return 0;
}`;
    } else if (inputValues.length === 1) {
      mainCode = `
int main() {
    int a; cin >> a;
    ${functionName}(a);
    return 0;
}`;
    } else if (inputValues.length === 2) {
      mainCode = `
int main() {
    int a, b; cin >> a >> b;
    ${functionName}(a, b);
    return 0;
}`;
    } else {
      mainCode = `
int main() {
    int n = ${inputValues.length};
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    ${functionName}(arr);
    return 0;
}`;
    }
  } else {
    if (inputValues.length === 0) {
      mainCode = `
int main() {
    auto result = ${functionName}();
    cout << result;
    return 0;
}`;
    } else if (inputValues.length === 1) {
      mainCode = `
int main() {
    int a; cin >> a;
    auto result = ${functionName}(a);
    cout << result;
    return 0;
}`;
    } else if (inputValues.length === 2) {
      mainCode = `
int main() {
    int a, b; cin >> a >> b;
    auto result = ${functionName}(a, b);
    cout << result;
    return 0;
}`;
    } else {
      mainCode = `
int main() {
    int n = ${inputValues.length};
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    auto result = ${functionName}(arr);
    cout << result;
    return 0;
}`;
    }
  }
  
  let wrappedCode = code;
  if (!code.includes('#include')) {
    wrappedCode = '#include <iostream>\n#include <vector>\nusing namespace std;\n' + wrappedCode;
  } else if (!code.includes('using namespace std') && !code.includes('std::')) {
    wrappedCode = code.replace('#include <iostream>', '#include <iostream>\n#include <vector>\nusing namespace std;');
  }
  
  return wrappedCode + mainCode;
};

// Wrap function code with main for Java
const wrapJavaCode = (code, functionName, inputValues) => {
  if (hasMainFunction(code, 'java')) return code;
  
  const classMatch = code.match(/public\s+class\s+(\w+)/);
  const className = classMatch ? classMatch[1] : 'Main';
  
  const returnTypeMatch = code.match(/(?:public\s+static\s+)?(int|long|double|float|char|boolean|String|void)\s+\w+\s*\(/);
  const returnType = returnTypeMatch ? returnTypeMatch[1] : 'int';
  
  let mainCode = '';
  
  if (returnType === 'void') {
    if (inputValues.length === 0) {
      mainCode = `
    public static void main(String[] args) {
        ${functionName}();
    }`;
    } else if (inputValues.length === 1) {
      mainCode = `
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        ${functionName}(a);
    }`;
    } else {
      mainCode = `
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        ${functionName}(a, b);
    }`;
    }
  } else {
    if (inputValues.length === 0) {
      mainCode = `
    public static void main(String[] args) {
        System.out.println(${functionName}());
    }`;
    } else if (inputValues.length === 1) {
      mainCode = `
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        System.out.println(${functionName}(a));
    }`;
    } else if (inputValues.length === 2) {
      mainCode = `
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(${functionName}(a, b));
    }`;
    } else {
      mainCode = `
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        System.out.println(${functionName}(arr));
    }`;
    }
  }
  
  let wrappedCode = code;
  if (!code.includes('import java.util.Scanner')) {
    wrappedCode = 'import java.util.Scanner;\n' + wrappedCode;
  }
  
  if (wrappedCode.endsWith('}')) {
    wrappedCode = wrappedCode.slice(0, -1) + mainCode + '\n}';
  } else {
    wrappedCode = wrappedCode + mainCode;
  }
  
  return wrappedCode;
};

// Wrap function code for Python - supports any number of inputs
const wrapPythonCode = (code, functionName, inputValues) => {
  if (hasMainFunction(code, 'python')) return code;
  
  let mainCode = '';
  
  if (inputValues.length === 0) {
    mainCode = `
if __name__ == "__main__":
    print(${functionName}())`;
  } else if (inputValues.length === 1) {
    mainCode = `
if __name__ == "__main__":
    a = int(input().strip())
    print(${functionName}(a))`;
  } else if (inputValues.length === 2) {
    mainCode = `
if __name__ == "__main__":
    import sys
    data = sys.stdin.read().strip().split()
    a, b = int(data[0]), int(data[1])
    print(${functionName}(a, b))`;
  } else {
    // More than 2 inputs - use list
    mainCode = `
if __name__ == "__main__":
    import sys
    arr = list(map(int, sys.stdin.read().strip().split()))
    print(${functionName}(arr))`;
  }
  
  return code + mainCode;
};

// Main wrapper function - dynamically handles any language
const wrapCode = (code, language, stdin) => {
  if (hasMainFunction(code, language)) {
    return code;
  }
  
  const inputValues = parseInput(stdin);
  const functionName = extractFunctionName(code, language);
  
  if (!functionName) {
    console.log('Could not extract function name, using original code');
    return code;
  }
  
  switch (language.toLowerCase()) {
    case 'c':
      return wrapCCode(code, functionName, inputValues);
    case 'cpp':
      return wrapCppCode(code, functionName, inputValues);
    case 'java':
      return wrapJavaCode(code, functionName, inputValues);
    case 'python':
      return wrapPythonCode(code, functionName, inputValues);
    default:
      return code;
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

// Execute Python locally - uses async spawn for better concurrency
const executePythonLocally = (sourceCode, stdin = '') => {
  return new Promise((resolve) => {
    const python = spawn('python', ['-c', sourceCode], {
      timeout: 10000,
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
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
    
    const compileResult = spawnSync(compiler, [srcFile, '-o', outFile, '-static', '-lm'], {
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
    // Cleanup
    try {
      require('fs').rmSync(tmpDir, { recursive: true, force: true });
    } catch (e) { /* ignore cleanup errors */ }
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
    try {
      require('fs').rmSync(tmpDir, { recursive: true, force: true });
    } catch (e) { /* ignore cleanup errors */ }
  }
};

// Local execution - supports concurrent users with isolated processes
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
  
  const wrappedCode = wrapCode(sourceCode, language, stdin);
  const languageId = getLanguageId(language);
  const judge0Available = await isJudge0Available();
  
  if (!judge0Available || !languageId) {
    const localResult = await executeLocally(wrappedCode, language, stdin);
    
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
      source_code: wrappedCode,
      language_id: languageId,
      stdin
    }, { timeout: 30000 });
    
    return response.data;
  } catch (error) {
    const localResult = await executeLocally(wrappedCode, language, stdin);
    
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

// Run all test cases - designed for concurrent multi-user support
const runAllTestCases = async (sourceCode, language, testCases) => {
  const results = [];
  let judge0Warning = null;
  
  const judge0Available = await isJudge0Available();
  if (!judge0Available) {
    judge0Warning = 'Executed locally';
  }
  
  // Process test cases concurrently for better performance
  const testPromises = testCases.map(async (testCase, index) => {
    try {
      const wrappedCode = wrapCode(sourceCode, language, testCase.input);
      const localResult = await executeLocally(wrappedCode, language, testCase.input);
      
      const actualOutput = (localResult.stdout || '').trim();
      const expectedOutput = (testCase.output || '').trim();
      const isPassed = actualOutput === expectedOutput;
      
      return {
        testCaseNumber: index + 1,
        input: testCase.input,
        expectedOutput: expectedOutput,
        actualOutput: actualOutput,
        status: localResult.error ? 'Runtime Error' : (isPassed ? 'Accepted' : 'Wrong Answer'),
        isPassed: isPassed,
        compile_output: localResult.stderr || ''
      };
    } catch (error) {
      return {
        testCaseNumber: index + 1,
        input: testCase.input,
        expectedOutput: (testCase.output || '').trim(),
        actualOutput: `Error: ${error.message}`,
        status: 'Runtime Error',
        isPassed: false,
        compile_output: error.message
      };
    }
  });
  
  const testResults = await Promise.all(testPromises);
  results.push(...testResults);
  
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
  const actualOutput = (result.stdout || '').trim();
  const isPassed = actualOutput === expectedOutput.trim();
  
  return {
    result,
    isPassed,
    actualOutput,
    expectedOutput: expectedOutput.trim()
  };
};

module.exports = { 
  submitCode, 
  runAllTestCases, 
  submitAndValidate,
  getLanguageId,
  LANGUAGE_IDS,
  isJudge0Available,
  isLanguageSupported
};
