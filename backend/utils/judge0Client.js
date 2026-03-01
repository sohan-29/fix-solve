const axios = require('axios');
const { execSync, spawnSync } = require('child_process');
const vm = require('vm');

const JUDGE0_URL = process.env.JUDGE0_URL || 'http://localhost:2358';

// Language IDs for Judge0
const LANGUAGE_IDS = {
  c: 50,
  cpp: 54,
  java: 62,
  python: 71,
  javascript: 63,
};

// Get language ID from language name
const getLanguageId = (language) => {
  return LANGUAGE_IDS[language.toLowerCase()] || 63;
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
    case 'javascript':
      // Check for function main() or IIFE or console.log at top level
      return /function\s+main\s*\(/.test(code) || 
             /\(function\s*\(\)\s*\{/.test(code) || 
             /\{[\s\S]*\}\s*\(\s*\)/.test(code) ||
             code.includes('main()');
    default:
      return false;
  }
};

// Extract function name from code
const extractFunctionName = (code, language) => {
  const lang = language.toLowerCase();
  
  switch (lang) {
    case 'c':
    case 'cpp': {
      // Match returnType functionName(params)
      const match = code.match(/(?:int|long|long long|void|double|float|char|bool)\s+(\w+)\s*\(/);
      return match ? match[1] : null;
    }
    case 'java': {
      // Match public static returnType functionName(params)
      const match = code.match(/(?:public\s+static\s+)?(?:int|long|double|float|char|boolean|String|void)\s+(\w+)\s*\(/);
      return match ? match[1] : null;
    }
    case 'python': {
      // Match def functionName(
      const match = code.match(/def\s+(\w+)\s*\(/);
      return match ? match[1] : null;
    }
    case 'javascript': {
      // Match function functionName(
      const match = code.match(/function\s+(\w+)\s*\(/);
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
  // Check if already has main
  if (hasMainFunction(code, 'c')) return code;
  
  // Determine return type to handle output
  const returnTypeMatch = code.match(/(int|long|long long|double|float|void)\s+\w+\s*\(/);
  const returnType = returnTypeMatch ? returnTypeMatch[1] : 'int';
  
  // Build the wrapper
  let inputSetup = '';
  let args = [];
  
  if (inputValues.length > 0) {
    inputSetup = `    scanf("%d", &a);`;
    if (inputValues.length > 1) {
      inputSetup = `    scanf("%d %d", &a, &b);`;
      if (inputValues.length > 2) {
        // For more than 2, use array
        inputSetup = `    int arr[${inputValues.length}];\n    for(int i = 0; i < ${inputValues.length}; i++) scanf("%d", &arr[i]);`;
      }
    }
  }
  
  // Generate main based on number of inputs and return type
  let mainCode = '';
  if (returnType === 'void') {
    mainCode = `
int main() {
    ${inputValues.length > 0 ? (inputValues.length <= 2 ? 
      `int a, b; scanf("%d %d", &a, &b);` + functionName + `(a, b);` :
      `int arr[${inputValues.length}]; for(int i = 0; i < ${inputValues.length}; i++) scanf("%d", &arr[i]);`) : 
      `${functionName}();`}
    return 0;
}`;
  } else if (inputValues.length === 0) {
    mainCode = `
int main() {
    long long result = ${functionName}();
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
  } else {
    mainCode = `
int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    ${returnType.includes('long') ? 'long long' : 'int'} result = ${functionName}(a, b);
    printf("%lld", result);
    return 0;
}`;
  }
  
  // Include necessary headers if not present
  let wrappedCode = code;
  if (!code.includes('#include')) {
    wrappedCode = '#include <stdio.h>\n' + wrappedCode;
  }
  
  return wrappedCode + mainCode;
};

// Wrap function code with main for C++
const wrapCppCode = (code, functionName, inputValues) => {
  if (hasMainFunction(code, 'cpp')) return code;
  
  const returnTypeMatch = code.match(/(int|long|long long|double|float|void|char|bool)\s+\w+\s*\(/);
  const returnType = returnTypeMatch ? returnTypeMatch[1] : 'int';
  
  let mainCode = '';
  if (returnType === 'void') {
    mainCode = `
int main() {
    ${inputValues.length > 0 ? 
      `int a, b; cin >> a >> b; ${functionName}(a, b);` : 
      `${functionName}();`}
    return 0;
}`;
  } else if (inputValues.length === 0) {
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
  } else {
    mainCode = `
int main() {
    int a, b; cin >> a >> b;
    auto result = ${functionName}(a, b);
    cout << result;
    return 0;
}`;
  }
  
  let wrappedCode = code;
  if (!code.includes('#include')) {
    wrappedCode = '#include <iostream>\nusing namespace std;\n' + wrappedCode;
  } else if (!code.includes('using namespace std') && !code.includes('std::')) {
    wrappedCode = code.replace('#include <iostream>', '#include <iostream>\nusing namespace std;');
  }
  
  return wrappedCode + mainCode;
};

// Wrap function code with main for Java
const wrapJavaCode = (code, functionName, inputValues) => {
  if (hasMainFunction(code, 'java')) return code;
  
  // Find class name
  const classMatch = code.match(/public\s+class\s+(\w+)/);
  const className = classMatch ? classMatch[1] : 'Main';
  
  // Find return type
  const returnTypeMatch = code.match(/(?:public\s+static\s+)?(int|long|double|float|char|boolean|String|void)\s+\w+\s*\(/);
  const returnType = returnTypeMatch ? returnTypeMatch[1] : 'int';
  
  let mainCode = '';
  if (returnType === 'void') {
    mainCode = `
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        ${inputValues.length > 0 ? 
          (inputValues.length === 1 ? 
            `int a = sc.nextInt(); ${functionName}(a);` :
            `int a = sc.nextInt(); int b = sc.nextInt(); ${functionName}(a, b);`) :
          `${functionName}();`}
    }`;
  } else if (inputValues.length === 0) {
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
  } else {
    mainCode = `
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(${functionName}(a, b));
    }`;
  }
  
  // Add Scanner import if not present
  let wrappedCode = code;
  if (!code.includes('import java.util.Scanner')) {
    wrappedCode = 'import java.util.Scanner;\n' + wrappedCode;
  }
  
  // Remove trailing brace and add main
  if (wrappedCode.endsWith('}')) {
    wrappedCode = wrappedCode.slice(0, -1) + mainCode + '\n}';
  } else {
    wrappedCode = wrappedCode + mainCode;
  }
  
  return wrappedCode;
};

// Wrap function code for Python
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
    a = input().strip()
    print(${functionName}(int(a)))`;
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

// Wrap function code for JavaScript
// Note: Judge0 uses Spidermonkey (not Node.js), so we use readline() which works in both
const wrapJavaScriptCode = (code, functionName, inputValues) => {
  if (hasMainFunction(code, 'javascript')) return code;
  
  let mainCode = '';
  if (inputValues.length === 0) {
    mainCode = `
console.log(${functionName}());`;
  } else if (inputValues.length === 1) {
    mainCode = `
var input = readline();
var a = parseInt(input);
console.log(${functionName}(a));`;
  } else if (inputValues.length === 2) {
    mainCode = `
var input = readline();
var parts = input.split(" ");
var a = parseInt(parts[0]);
var b = parseInt(parts[1]);
console.log(${functionName}(a, b));`;
  } else {
    mainCode = `
var input = readline();
var arr = input.split(" ").map(Number);
console.log(${functionName}(arr));`;
  }
  
  return code + '\n' + mainCode;
};

// Main wrapper function that wraps code based on language and input
const wrapCode = (code, language, stdin) => {
  // Check if code already has main
  if (hasMainFunction(code, language)) {
    return code;
  }
  
  // Parse input to determine how many arguments needed
  const inputValues = parseInput(stdin);
  
  // Extract function name
  const functionName = extractFunctionName(code, language);
  
  if (!functionName) {
    // Can't extract function name, return as-is
    console.log('Could not extract function name, using original code');
    return code;
  }
  
  // Wrap based on language
  switch (language.toLowerCase()) {
    case 'c':
      return wrapCCode(code, functionName, inputValues);
    case 'cpp':
      return wrapCppCode(code, functionName, inputValues);
    case 'java':
      return wrapJavaCode(code, functionName, inputValues);
    case 'python':
      return wrapPythonCode(code, functionName, inputValues);
    case 'javascript':
      return wrapJavaScriptCode(code, functionName, inputValues);
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

// Local JavaScript execution using vm module
const executeJavaScriptLocally = (sourceCode, stdin = '') => {
  try {
    // Create a sandbox with console.log capture
    let output = '';
    const sandbox = {
      console: {
        log: (...args) => {
          output += args.map(arg => String(arg)).join(' ') + '\n';
        }
      },
      // Common input handling
      input: stdin,
      readLine: () => {
        const lines = stdin.split('\n');
        return lines.shift() || '';
      }
    };
    
    // Add common functions that might be used
    sandbox.console = Object.assign(
      {},
      sandbox.console,
      {
        error: (...args) => { console.error(...args); },
        warn: (...args) => { console.warn(...args); },
        info: (...args) => { console.info(...args); }
      }
    );

    // Parse function from source code and call it if it's a function
    // This handles common patterns like: function add(a,b) { return a+b; } add(1,2)
    const wrappedCode = `
      (function() {
        ${sourceCode}
        // Try to find and call a function if there's no explicit call
        // This handles the case where code defines a function but doesn't call it
      })();
    `;
    
    const context = vm.createContext(sandbox);
    
    try {
      const script = new vm.Script(wrappedCode);
      script.runInContext(context, { timeout: 5000 });
    } catch (e) {
      // If execution fails, try to parse output from console.log statements
      // or return error
      if (output.trim()) {
        return { stdout: output.trim(), stderr: '', error: null };
      }
      return { stdout: '', stderr: e.message, error: e };
    }

    // If there's output from console.log, use it
    if (output.trim()) {
      return { stdout: output.trim(), stderr: '', error: null };
    }
    
    // No output - code might have run but produced no output
    return { stdout: '', stderr: '', error: null };
  } catch (error) {
    return { stdout: '', stderr: error.message, error };
  }
};

// Execute Python locally
const executePythonLocally = (sourceCode, stdin = '') => {
  try {
    const result = spawnSync('python', ['-c', sourceCode], {
      input: stdin,
      timeout: 5000,
      encoding: 'utf-8'
    });
    
    return {
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      error: result.error
    };
  } catch (error) {
    return { stdout: '', stderr: error.message, error };
  }
};

// Execute C/C++ locally (requires gcc/g++ installed)
const executeCLocally = (sourceCode, stdin = '', isCpp = false) => {
  const ext = isCpp ? 'cpp' : 'c';
  const compiler = isCpp ? 'g++' : 'gcc';
  const tmpFile = `/tmp/code_${Date.now()}.${ext}`;
  
  try {
    // Write source to temp file
    require('fs').writeFileSync(tmpFile, sourceCode);
    
    // Compile
    const compileResult = spawnSync(compiler, [tmpFile, '-o', `${tmpFile}.out`], {
      encoding: 'utf-8',
      timeout: 10000
    });
    
    if (compileResult.status !== 0) {
      return { stdout: '', stderr: compileResult.stderr || 'Compilation failed', error: new Error('Compilation failed') };
    }
    
    // Run
    const runResult = spawnSync(`${tmpFile}.out`, [], {
      input: stdin,
      timeout: 5000,
      encoding: 'utf-8'
    });
    
    // Cleanup
    try {
      require('fs').unlinkSync(tmpFile);
      require('fs').unlinkSync(`${tmpFile}.out`);
    } catch (e) { /* ignore cleanup errors */ }
    
    return {
      stdout: runResult.stdout || '',
      stderr: runResult.stderr || '',
      error: runResult.error
    };
  } catch (error) {
    return { stdout: '', stderr: error.message, error };
  }
};

// Execute Java locally (requires javac/java installed)
const executeJavaLocally = (sourceCode, stdin = '') => {
  try {
    // Extract class name from source
    const classMatch = sourceCode.match(/public\s+class\s+(\w+)/);
    const className = classMatch ? classMatch[1] : 'Main';
    
    const tmpDir = `/tmp/java_${Date.now()}`;
    require('fs').mkdirSync(tmpDir, { recursive: true });
    
    // Write source file
    require('fs').writeFileSync(`${tmpDir}/${className}.java`, sourceCode);
    
    // Compile
    const compileResult = spawnSync('javac', [`${tmpDir}/${className}.java`], {
      encoding: 'utf-8',
      timeout: 10000,
      cwd: tmpDir
    });
    
    if (compileResult.status !== 0) {
      return { stdout: '', stderr: compileResult.stderr || 'Compilation failed', error: new Error('Compilation failed') };
    }
    
    // Run
    const runResult = spawnSync('java', ['-cp', tmpDir, className], {
      input: stdin,
      timeout: 5000,
      encoding: 'utf-8'
    });
    
    // Cleanup
    try {
      require('fs').rmSync(tmpDir, { recursive: true, force: true });
    } catch (e) { /* ignore cleanup errors */ }
    
    return {
      stdout: runResult.stdout || '',
      stderr: runResult.stderr || '',
      error: runResult.error
    };
  } catch (error) {
    return { stdout: '', stderr: error.message, error };
  }
};

// Local execution fallback
const executeLocally = (sourceCode, language, stdin = '') => {
  switch (language.toLowerCase()) {
    case 'javascript':
      return executeJavaScriptLocally(sourceCode, stdin);
    case 'python':
      return executePythonLocally(sourceCode, stdin);
    case 'c':
      return executeCLocally(sourceCode, stdin, false);
    case 'cpp':
      return executeCLocally(sourceCode, stdin, true);
    case 'java':
      return executeJavaLocally(sourceCode, stdin);
    default:
      return { stdout: '', stderr: `Language ${language} not supported for local execution`, error: new Error('Unsupported language') };
  }
};

// Submit code to Judge0 for a single test case
const submitCode = async (sourceCode, language, stdin = '') => {
  // Wrap the code with main function if needed
  const wrappedCode = wrapCode(sourceCode, language, stdin);
  
  const languageId = getLanguageId(language);
  const judge0Available = await isJudge0Available();
  
  if (!judge0Available) {
    // Use local execution fallback instead of returning error
    const localResult = executeLocally(wrappedCode, language, stdin);
    
    return {
      status: { 
        id: localResult.error ? 6 : 3, // 3 = Accepted if no error
        description: localResult.error ? 'Runtime Error' : 'Accepted' 
      },
      stdout: localResult.stdout,
      stderr: localResult.stderr,
      compile_output: '',
      message: localResult.error ? `Local execution error: ${localResult.stderr}` : 'Executed locally (Judge0 unavailable)'
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
    console.log('Judge0 request failed:', error.message);
    // Fallback to local execution on error
    const localResult = executeLocally(wrappedCode, language, stdin);
    
    return {
      status: { 
        id: localResult.error ? 6 : 3,
        description: localResult.error ? 'Runtime Error' : 'Accepted' 
      },
      stdout: localResult.stdout,
      stderr: localResult.stderr,
      compile_output: '',
      message: localResult.error ? `Local execution error: ${localResult.stderr}` : 'Executed locally (Judge0 unavailable)'
    };
  }
};

// Submit code and run against multiple test cases
const runAllTestCases = async (sourceCode, language, testCases) => {
  const results = [];
  let judge0Warning = null;
  let executedLocally = false;
  
  const judge0Available = await isJudge0Available();
  
  // If Judge0 is not available, use local execution
  if (!judge0Available) {
    judge0Warning = 'Executed locally (Judge0 unavailable)';
    executedLocally = true;
  }
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    try {
      let result;
      
      // Wrap code for this test case
      const wrappedCode = wrapCode(sourceCode, language, testCase.input);
      
      if (executedLocally) {
        // Use local execution with wrapped code
        const localResult = executeLocally(wrappedCode, language, testCase.input);
        result = {
          status: { 
            id: localResult.error ? 6 : 3,
            description: localResult.error ? 'Runtime Error' : 'Accepted' 
          },
          stdout: localResult.stdout,
          stderr: localResult.stderr,
          compile_output: localResult.stderr
        };
      } else {
        // Use Judge0 (submitCode already wraps the code internally)
        result = await submitCode(sourceCode, language, testCase.input);
      }
      
      const actualOutput = (result.stdout || '').trim();
      const expectedOutput = (testCase.output || '').trim();
      const isPassed = actualOutput === expectedOutput;
      
      results.push({
        testCaseNumber: i + 1,
        input: testCase.input,
        expectedOutput: expectedOutput,
        actualOutput: actualOutput,
        status: result.status?.description || (executedLocally ? 'Local Execution' : 'Unknown'),
        isPassed: isPassed,
        time: result.time,
        memory: result.memory,
        compile_output: result.compile_output || ''
      });
    } catch (error) {
      // Fallback to local execution on error with wrapped code
      const wrappedCode = wrapCode(sourceCode, language, testCase.input);
      const localResult = executeLocally(wrappedCode, language, testCase.input);
      const actualOutput = (localResult.stdout || '').trim();
      const expectedOutput = (testCase.output || '').trim();
      const isPassed = actualOutput === expectedOutput;
      
      results.push({
        testCaseNumber: i + 1,
        input: testCase.input,
        expectedOutput: expectedOutput,
        actualOutput: actualOutput || `Error: ${error.message}`,
        status: localResult.error ? 'Runtime Error' : (isPassed ? 'Accepted' : 'Wrong Answer'),
        isPassed: isPassed
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
  isJudge0Available
};
