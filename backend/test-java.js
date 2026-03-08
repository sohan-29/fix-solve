const { runAllTestCases } = require('./utils/judge0Client');

async function test() {
  console.log('=== Testing Java Buggy Code (Should Return Wrong Answer) ===');
  const javaCode = `// Fix the bug in this function
import java.util.Scanner;

public class Main {
    public static int add(int a, int b) {
        // should return sum
        return a - b;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.print(add(a, b));
    }
}`;
  const r1 = await runAllTestCases(javaCode, 'java', [{input:'5\n3', output:'8'}]);
  console.log('Buggy Code - Expected: 8, Got:', r1.results[0].actualOutput);
  console.log('Status:', r1.summary.allPassed ? 'PASS (BUG NOT FIXED!)' : 'FAIL (CORRECT - Wrong Answer)');

  console.log('\n=== Testing Java Fixed Code (Should Return Correct Answer) ===');
  const javaCodeFixed = `// Fix the bug in this function
import java.util.Scanner;

public class Main {
    public static int add(int a, int b) {
        // should return sum
        return a + b;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.print(add(a, b));
    }
}`;
  const r2 = await runAllTestCases(javaCodeFixed, 'java', [{input:'5\n3', output:'8'}]);
  console.log('Fixed Code - Expected: 8, Got:', r2.results[0].actualOutput);
  console.log('Status:', r2.summary.allPassed ? 'PASS (CORRECT!)' : 'FAIL');
  
  console.log('\n=== ALL TESTS COMPLETE ===');
}

test();
