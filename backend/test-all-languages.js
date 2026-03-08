const { runAllTestCases } = require('./utils/judge0Client');

const problems = [
    {
        name: "Sum Function (2 inputs)",
        testCases: [
            { input: '5\n3', output: '8' },
            { input: '10\n20', output: '30' },
            { input: '-5\n5', output: '0' }
        ]
    },
    {
        name: "Maximum Function (2 inputs)",
        testCases: [
            { input: '5\n3', output: '5' },
            { input: '10\n20', output: '20' },
            { input: '-5\n-1', output: '-1' }
        ]
    },
    {
        name: "Even-Odd Function (1 input)",
        testCases: [
            { input: '4', output: 'Even' },
            { input: '7', output: 'Odd' },
            { input: '0', output: 'Even' }
        ]
    }
];

const languages = {
    c: {
        sum: `#include <stdio.h>

int add(int a, int b) {
    return a + b;
}

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d", add(a, b));
    return 0;
}`,
        maximum: `#include <stdio.h>

int maxOfTwo(int a, int b) {
    return (a > b) ? a : b;
}

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d", maxOfTwo(a, b));
    return 0;
}`,
        evenodd: `#include <stdio.h>

const char* checkEvenOdd(int n) {
    if (n % 2 == 0)
        return "Even";
    else
        return "Odd";
}

int main() {
    int n;
    scanf("%d", &n);
    printf("%s", checkEvenOdd(n));
    return 0;
}`
    },
    cpp: {
        sum: `#include <iostream>
using namespace std;

int add(int a, int b) {
    return a + b;
}

int main() {
    int a, b;
    cin >> a >> b;
    cout << add(a, b);
    return 0;
}`,
        maximum: `#include <iostream>
using namespace std;

int maxOfTwo(int a, int b) {
    return (a > b) ? a : b;
}

int main() {
    int a, b;
    cin >> a >> b;
    cout << maxOfTwo(a, b);
    return 0;
}`,
        evenodd: `#include <iostream>
using namespace std;

string checkEvenOdd(int n) {
    if (n % 2 == 0)
        return "Even";
    else
        return "Odd";
}

int main() {
    int n;
    cin >> n;
    cout << checkEvenOdd(n);
    return 0;
}`
    },
    java: {
        sum: `import java.util.Scanner;

public class Main {
    public static int add(int a, int b) {
        return a + b;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.print(add(a, b));
    }
}`,
        maximum: `import java.util.Scanner;

public class Main {
    public static int maxOfTwo(int a, int b) {
        return (a > b) ? a : b;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.print(maxOfTwo(a, b));
    }
}`,
        evenodd: `import java.util.Scanner;

public class Main {
    public static String checkEvenOdd(int n) {
        if (n % 2 == 0)
            return "Even";
        else
            return "Odd";
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.print(checkEvenOdd(n));
    }
}`
    },
    python: {
        sum: `def add(a, b):
    return a + b

if __name__ == "__main__":
    a = int(input().strip())
    b = int(input().strip())
    print(add(a, b))`,
        maximum: `def maxOfTwo(a, b):
    return a if a > b else b

if __name__ == "__main__":
    a = int(input().strip())
    b = int(input().strip())
    print(maxOfTwo(a, b))`,
        evenodd: `def checkEvenOdd(n):
    if n % 2 == 0:
        return "Even"
    else:
        return "Odd"

if __name__ == "__main__":
    n = int(input().strip())
    print(checkEvenOdd(n))`
    }
};

async function runTests() {
    console.log("Testing all languages with multiple inputs...\n");

    for (const [lang, codes] of Object.entries(languages)) {
        console.log(`\n=== ${lang.toUpperCase()} ===`);

        // Test Sum (2 inputs)
        console.log(`\nTesting Sum (2 inputs):`);
        try {
            const sumResult = await runAllTestCases(codes.sum, lang, problems[0].testCases);
            console.log(`  Sum: ${sumResult.summary.allPassed ? '✓ PASSED' : '✗ FAILED'} (${sumResult.summary.passed}/${sumResult.summary.total})`);
            if (!sumResult.summary.allPassed) {
                console.log(`  Failed test cases:`);
                sumResult.results.forEach((r, i) => {
                    if (!r.isPassed) {
                        console.log(`    Test ${i+1}: Input="${r.input}" Expected="${r.expectedOutput}" Got="${r.actualOutput}"`);
                    }
                });
            }
        } catch (err) {
            console.log(`  Sum: ✗ ERROR - ${err.message}`);
        }

        // Test Maximum (2 inputs)
        console.log(`\nTesting Maximum (2 inputs):`);
        try {
            const maxResult = await runAllTestCases(codes.maximum, lang, problems[1].testCases);
            console.log(`  Maximum: ${maxResult.summary.allPassed ? '✓ PASSED' : '✗ FAILED'} (${maxResult.summary.passed}/${maxResult.summary.total})`);
            if (!maxResult.summary.allPassed) {
                console.log(`  Failed test cases:`);
                maxResult.results.forEach((r, i) => {
                    if (!r.isPassed) {
                        console.log(`    Test ${i+1}: Input="${r.input}" Expected="${r.expectedOutput}" Got="${r.actualOutput}"`);
                    }
                });
            }
        } catch (err) {
            console.log(`  Maximum: ✗ ERROR - ${err.message}`);
        }

        // Test Even-Odd (1 input)
        console.log(`\nTesting Even-Odd (1 input):`);
        try {
            const evenOddResult = await runAllTestCases(codes.evenodd, lang, problems[2].testCases);
            console.log(`  Even-Odd: ${evenOddResult.summary.allPassed ? '✓ PASSED' : '✗ FAILED'} (${evenOddResult.summary.passed}/${evenOddResult.summary.total})`);
            if (!evenOddResult.summary.allPassed) {
                console.log(`  Failed test cases:`);
                evenOddResult.results.forEach((r, i) => {
                    if (!r.isPassed) {
                        console.log(`    Test ${i+1}: Input="${r.input}" Expected="${r.expectedOutput}" Got="${r.actualOutput}"`);
                    }
                });
            }
        } catch (err) {
            console.log(`  Even-Odd: ✗ ERROR - ${err.message}`);
        }
    }

    console.log("\n\n=== All Tests Complete ===");
}

runTests();
