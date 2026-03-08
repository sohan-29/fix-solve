const { runAllTestCases } = require('./utils/judge0Client');

// Test all problems with all languages
async function quickTest() {
    const testCases = {
        sum: [
            { input: '5\n3', output: '8' },
            { input: '10\n20', output: '30' },
            { input: '-5\n5', output: '0' }
        ],
        max: [
            { input: '5\n3', output: '5' },
            { input: '10\n20', output: '20' },
            { input: '-5\n-1', output: '-1' }
        ],
        evenodd: [
            { input: '4', output: 'Even' },
            { input: '7', output: 'Odd' },
            { input: '0', output: 'Even' }
        ]
    };

    const codes = {
        c: {
            sum: `#include <stdio.h>
int add(int a, int b) { return a + b; }
int main() { int a, b; scanf("%d %d", &a, &b); printf("%d", add(a, b)); return 0; }`,
            max: `#include <stdio.h>
int maxOfTwo(int a, int b) { return (a > b) ? a : b; }
int main() { int a, b; scanf("%d %d", &a, &b); printf("%d", maxOfTwo(a, b)); return 0; }`,
            evenodd: `#include <stdio.h>
const char* checkEvenOdd(int n) { return (n % 2 == 0) ? "Even" : "Odd"; }
int main() { int n; scanf("%d", &n); printf("%s", checkEvenOdd(n)); return 0; }`
        },
        cpp: {
            sum: `#include <iostream>
using namespace std;
int add(int a, int b) { return a + b; }
int main() { int a, b; cin >> a >> b; cout << add(a, b); return 0; }`,
            max: `#include <iostream>
using namespace std;
int maxOfTwo(int a, int b) { return (a > b) ? a : b; }
int main() { int a, b; cin >> a >> b; cout << maxOfTwo(a, b); return 0; }`,
            evenodd: `#include <iostream>
using namespace std;
string checkEvenOdd(int n) { return (n % 2 == 0) ? "Even" : "Odd"; }
int main() { int n; cin >> n; cout << checkEvenOdd(n); return 0; }`
        },
        java: {
            sum: `import java.util.Scanner;
public class Main {
    public static int add(int a, int b) { return a + b; }
    public static void main(String[] args) { Scanner sc = new Scanner(System.in); int a = sc.nextInt(); int b = sc.nextInt(); System.out.print(add(a, b)); }
}`,
            max: `import java.util.Scanner;
public class Main {
    public static int maxOfTwo(int a, int b) { return (a > b) ? a : b; }
    public static void main(String[] args) { Scanner sc = new Scanner(System.in); int a = sc.nextInt(); int b = sc.nextInt(); System.out.print(maxOfTwo(a, b)); }
}`,
            evenodd: `import java.util.Scanner;
public class Main {
    public static String checkEvenOdd(int n) { return (n % 2 == 0) ? "Even" : "Odd"; }
    public static void main(String[] args) { Scanner sc = new Scanner(System.in); int n = sc.nextInt(); System.out.print(checkEvenOdd(n)); }
}`
        },
        python: {
            sum: `def add(a, b): return a + b
if __name__ == "__main__":
    a = int(input().strip())
    b = int(input().strip())
    print(add(a, b))`,
            max: `def maxOfTwo(a, b): return a if a > b else b
if __name__ == "__main__":
    a = int(input().strip())
    b = int(input().strip())
    print(maxOfTwo(a, b))`,
            evenodd: `def checkEvenOdd(n): return "Even" if n % 2 == 0 else "Odd"
if __name__ == "__main__":
    n = int(input().strip())
    print(checkEvenOdd(n))`
        }
    };

    console.log("Testing all languages with multiple inputs...\n");
    let allPassed = true;

    for (const lang of ['c', 'cpp', 'java', 'python']) {
        console.log(`\n=== ${lang.toUpperCase()} ===`);
        
        for (const [problem, cases] of Object.entries(testCases)) {
            try {
                const result = await runAllTestCases(codes[lang][problem], lang, cases);
                const passed = result.summary.allPassed ? '✓' : '✗';
                console.log(`  ${problem}: ${passed} (${result.summary.passed}/${result.summary.total})`);
                if (!result.summary.allPassed) {
                    allPassed = false;
                    result.results.forEach((r, i) => {
                        if (!r.isPassed) console.log(`    Input: "${r.input}" Expected: "${r.expectedOutput}" Got: "${r.actualOutput}"`);
                    });
                }
            } catch (err) {
                console.log(`  ${problem}: ERROR - ${err.message}`);
                allPassed = false;
            }
        }
    }

    console.log(`\n\n=== FINAL RESULT: ${allPassed ? 'ALL TESTS PASSED ✓' : 'SOME TESTS FAILED ✗'} ===`);
}

quickTest();
