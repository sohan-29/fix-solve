const { runAllTestCases } = require('./utils/judge0Client');

async function test() {
  // Test Python with complete code (from seed)
  console.log('=== Testing Python (complete code) ===');
  const pythonCode = `def add(a, b):
    return a + b

if __name__ == "__main__":
    a = int(input().strip())
    b = int(input().strip())
    print(add(a, b))`;
  const pythonResult = await runAllTestCases(pythonCode, 'python', [
    { input: '5\n3', output: '8' },
    { input: '10\n20', output: '30' }
  ]);
  console.log('Python results:', JSON.stringify(pythonResult, null, 2));
  
  // Test C with complete code (from seed)
  console.log('\n=== Testing C (complete code) ===');
  const cCode = `#include <stdio.h>

int add(int a, int b) {
    return a + b;
}

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d", add(a, b));
    return 0;
}`;
  const cResult = await runAllTestCases(cCode, 'c', [
    { input: '5\n3', output: '8' },
    { input: '10\n20', output: '30' }
  ]);
  console.log('C results:', JSON.stringify(cResult, null, 2));
  
  // Test C++ with complete code (from seed)
  console.log('\n=== Testing C++ (complete code) ===');
  const cppCode = `#include <iostream>
using namespace std;

int add(int a, int b) {
    return a + b;
}

int main() {
    int a, b;
    cin >> a >> b;
    cout << add(a, b);
    return 0;
}`;
  const cppResult = await runAllTestCases(cppCode, 'cpp', [
    { input: '5\n3', output: '8' },
    { input: '10\n20', output: '30' }
  ]);
  console.log('C++ results:', JSON.stringify(cppResult, null, 2));
  
  // Test Java with complete code (from seed)
  console.log('\n=== Testing Java (complete code) ===');
  const javaCode = `public class Main {
    public static int add(int a, int b) {
        return a + b;
    }
    
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(add(a, b));
    }
}`;
  const javaResult = await runAllTestCases(javaCode, 'java', [
    { input: '5\n3', output: '8' },
    { input: '10\n20', output: '30' }
  ]);
  console.log('Java results:', JSON.stringify(javaResult, null, 2));
}

test();
