const { runAllTestCases } = require('./utils/judge0Client');

async function test() {
  console.log('=== Testing Java ===');
  const javaCode = `import java.util.Scanner;
public class Main {
    public static int add(int a, int b) { return a + b; }
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.print(add(a, b));
    }
}`;
  const r1 = await runAllTestCases(javaCode, 'java', [{input:'5\n3', output:'8'}]);
  console.log('Java sum:', r1.summary.allPassed ? 'PASS' : 'FAIL', '| Got:', r1.results[0].actualOutput);

  console.log('\n=== Testing Python ===');
  const pyCode = `def add(a, b):
    return a + b

if __name__ == "__main__":
    a = int(input())
    b = int(input())
    print(add(a, b))`;
  const r2 = await runAllTestCases(pyCode, 'python', [{input:'5\n3', output:'8'}]);
  console.log('Python sum:', r2.summary.allPassed ? 'PASS' : 'FAIL', '| Got:', r2.results[0].actualOutput);
  
  console.log('\n=== Testing C ===');
  const cCode = `#include <stdio.h>
int add(int a, int b) { return a + b; }
int main() { int a,b; scanf("%d%d",&a,&b); printf("%d", add(a,b)); return 0; }`;
  const r3 = await runAllTestCases(cCode, 'c', [{input:'5\n3', output:'8'}]);
  console.log('C sum:', r3.summary.allPassed ? 'PASS' : 'FAIL', '| Got:', r3.results[0].actualOutput);
  
  console.log('\n=== Testing C++ ===');
  const cppCode = `#include <iostream>
using namespace std;
int add(int a, int b) { return a + b; }
int main() { int a,b; cin >> a >> b; cout << add(a,b); return 0; }`;
  const r4 = await runAllTestCases(cppCode, 'cpp', [{input:'5\n3', output:'8'}]);
  console.log('C++ sum:', r4.summary.allPassed ? 'PASS' : 'FAIL', '| Got:', r4.results[0].actualOutput);
  
  console.log('\n=== ALL TESTS COMPLETE ===');
}

test();
