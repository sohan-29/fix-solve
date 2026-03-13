const { executeLocally } = require('./utils/judge0Client');

// Test Java code execution directly
const javaCode = `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(a + b);
    }
}`;

console.log('Testing Java locally...');
console.log('Code:', javaCode.substring(0, 100) + '...');
console.log('Input: "5\\n3"');
console.log('---');

const result = executeLocally(javaCode, 'java', '5\n3');
console.log('stdout:', JSON.stringify(result.stdout));
console.log('stderr:', JSON.stringify(result.stderr));
console.log('error:', result.error ? result.error.message : 'none');
console.log('---');

if (result.stdout.trim() === '8') {
  console.log('Java: PASS');
} else {
  console.log('Java: FAIL - expected "8" got "' + result.stdout.trim() + '"');
}
