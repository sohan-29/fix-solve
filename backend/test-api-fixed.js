const { runAllTestCases } = require('./utils/judge0Client');

// Test the FIXED code
const fixedCode = `def add(a, b):
    return a + b

if __name__ == "__main__":
    a = int(input())
    b = int(input())
    print(add(a, b))`;

const testCases = [
  { input: '5\n3', output: '8' },
  { input: '10\n20', output: '30' },
  { input: '-5\n5', output: '0' }
];

async function test() {
  console.log('=== Testing FIXED Python Code ===');
  const result = await runAllTestCases(fixedCode, 'python', testCases);
  console.log('Results:', JSON.stringify(result, null, 2));
}

test();
