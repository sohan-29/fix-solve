const axios = require('axios');
const API = 'http://localhost:3000/api';

async function testAllLanguages() {
  console.log('=== Testing All 4 Languages ===\n');
  
  // Get Round 1 problems to find our test problem
  const problemsRes = await axios.get(`${API}/problems/round/1`);
  const problem = problemsRes.data[0];
  console.log(`Test problem: ${problem.title} (ID: ${problem._id})\n`);

  // Correct solutions for each language (fix the bug: - to +)
  const solutions = {
    c: `#include <stdio.h>
int main() {
    int a, b;
    scanf("%d", &a);
    scanf("%d", &b);
    printf("%d", a + b);
    return 0;
}`,
    cpp: `#include <iostream>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b;
    return 0;
}`,
    java: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(a + b);
    }
}`,
    python: `a = int(input())
b = int(input())
print(a + b)`
  };

  const results = {};
  
  for (const [lang, code] of Object.entries(solutions)) {
    try {
      console.log(`Testing ${lang.toUpperCase()}...`);
      const res = await axios.post(`${API}/submissions`, {
        problemId: problem._id,
        code: code,
        language: lang,
        userId: 'anonymous',
        round: 1,
        isRun: true
      });
      
      const data = res.data;
      const status = data.status || 'Unknown';
      const visiblePassed = data.result?.summary?.visiblePassed;
      const testResults = data.result?.visible?.results || [];
      
      console.log(`  Status: ${status}`);
      console.log(`  Visible tests passed: ${visiblePassed}`);
      
      for (const tc of testResults) {
        console.log(`  Test ${tc.testCaseNumber}: ${tc.isPassed ? 'PASS' : 'FAIL'} (expected: "${tc.expectedOutput}", got: "${tc.actualOutput}")`);
      }
      
      results[lang] = visiblePassed ? 'PASS' : 'FAIL';
      console.log(`  Result: ${results[lang]}\n`);
    } catch(e) {
      console.error(`  ERROR for ${lang}: ${e.response?.data?.error || e.message}\n`);
      results[lang] = 'ERROR';
    }
  }

  console.log('=== SUMMARY ===');
  for (const [lang, result] of Object.entries(results)) {
    console.log(`  ${lang.toUpperCase()}: ${result}`);
  }
  
  const allPassed = Object.values(results).every(r => r === 'PASS');
  console.log(`\nOverall: ${allPassed ? 'ALL 4 LANGUAGES PASS ✓' : 'SOME LANGUAGES FAILED ✗'}`);
}

testAllLanguages().catch(e => console.error('Fatal error:', e.message));
