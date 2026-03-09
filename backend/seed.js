const mongoose = require('mongoose');
require('dotenv').config();

const Problem = require('./models/problem');

const problems = [
  // Round 1 - Debugging Problems
  {
    title: 'Fix the Sum Function',
    description: 'The following function should return the sum of two numbers, but it has a bug. Find and fix it! The bug is that it subtracts instead of adding.\n\nDO NOT MODIFY THE MAIN FUNCTION - Only fix the add() function.',
    roundType: 1,
    inputFormat: 'Two numbers a and b on separate lines',
    outputFormat: 'Sum of a and b',
    constraints: 'a, b can be any integers',
    sampleInput: '5\n3',
    sampleOutput: '8',
    bugCodeByLanguage: {
      c: `// Fix the bug in this function
// DO NOT MODIFY THE MAIN FUNCTION

#include <stdio.h>

int add(int a, int b) {
  // should return sum
  return a - b;
}

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d", add(a, b));
    return 0;
}`,
      cpp: `// Fix the bug in this function
// DO NOT MODIFY THE MAIN FUNCTION

#include <iostream>
using namespace std;

int add(int a, int b) {
  // should return sum
  return a - b;
}

int main() {
    int a, b;
    cin >> a >> b;
    cout << add(a, b);
    return 0;
}`,
      java: `// Fix the bug in this function
// DO NOT MODIFY THE MAIN FUNCTION

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
        System.out.println(add(a, b));
    }
}`,
      python: `# Fix the bug in this function
# DO NOT MODIFY THE MAIN FUNCTION

def add(a, b):
    # should return sum
    return a - b

if __name__ == "__main__":
    a = int(input().strip())
    b = int(input().strip())
    print(add(a, b))`
    },
    starterCodeByLanguage: {
      c: `// Fix the bug in this function
// DO NOT MODIFY THE MAIN FUNCTION

#include <stdio.h>

int add(int a, int b) {
  // should return sum
  return a - b;
}

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d", add(a, b));
    return 0;
}`,
      cpp: `// Fix the bug in this function
// DO NOT MODIFY THE MAIN FUNCTION

#include <iostream>
using namespace std;

int add(int a, int b) {
  // should return sum
  return a - b;
}

int main() {
    int a, b;
    cin >> a >> b;
    cout << add(a, b);
    return 0;
}`,
      java: `// Fix the bug in this function
// DO NOT MODIFY THE MAIN FUNCTION

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
        System.out.println(add(a, b));
    }
}`,
      python: `# Fix the bug in this function
# DO NOT MODIFY THE MAIN FUNCTION

def add(a, b):
    # should return sum
    return a - b

if __name__ == "__main__":
    a = int(input().strip())
    b = int(input().strip())
    print(add(a, b))`
    },
    supportedLanguages: ['c', 'cpp', 'java', 'python'],
    testCases: [
      { input: '5\n3', output: '8' },
      { input: '10\n20', output: '30' },
      { input: '-5\n5', output: '0' }
    ],
    hiddenTestCases: [
      { input: '100\n200', output: '300' },
      { input: '0\n0', output: '0' }
    ],
    timeLimit: 60,
    difficulty: 'Easy',
    complexity: 'O(1)'
  },
  {
    title: 'Fix the Even-Odd Function',
    description: 'The following function should return "Even" if the number is even and "Odd" if the number is odd. But it has a bug. Find and fix it!\n\nDO NOT MODIFY THE MAIN FUNCTION - Only fix the checkEvenOdd() function.',
    roundType: 1,
    inputFormat: 'A single integer n',
    outputFormat: 'Even or Odd',
    constraints: 'n can be any integer',
    sampleInput: '4',
    sampleOutput: 'Even',
    bugCodeByLanguage: {
      c: `// Fix the bug in this function
// DO NOT MODIFY THE MAIN FUNCTION

#include <stdio.h>

const char* checkEvenOdd(int n) {
    if (n % 2 == 1)  // Bug: should be == 0 for even
        return "Even";
    else
        return "Odd";
}

int main() {
    int n;
    scanf("%d", &n);
    printf("%s", checkEvenOdd(n));
    return 0;
}`,
      cpp: `// Fix the bug in this function
// DO NOT MODIFY THE MAIN FUNCTION

#include <iostream>
using namespace std;

string checkEvenOdd(int n) {
    if (n % 2 == 1)  // Bug: should be == 0 for even
        return "Even";
    else
        return "Odd";
}

int main() {
    int n;
    cin >> n;
    cout << checkEvenOdd(n);
    return 0;
}`,
      java: `// Fix the bug in this function
// DO NOT MODIFY THE MAIN FUNCTION

import java.util.Scanner;

public class Main {
    public static String checkEvenOdd(int n) {
        if (n % 2 == 1)  // Bug: should be == 0 for even
            return "Even";
        else
            return "Odd";
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.println(checkEvenOdd(n));
    }
}`,
      python: `# Fix the bug in this function
# DO NOT MODIFY THE MAIN FUNCTION

def checkEvenOdd(n):
    if n % 2 == 1:  # Bug: should be == 0 for even
        return "Even"
    else:
        return "Odd"

if __name__ == "__main__":
    n = int(input().strip())
    print(checkEvenOdd(n))`
    },
    starterCodeByLanguage: {
      c: `// Fix the bug in this function
// DO NOT MODIFY THE MAIN FUNCTION

#include <stdio.h>

const char* checkEvenOdd(int n) {
    if (n % 2 == 1)  // Bug: should be == 0 for even
        return "Even";
    else
        return "Odd";
}

int main() {
    int n;
    scanf("%d", &n);
    printf("%s", checkEvenOdd(n));
    return 0;
}`,
      cpp: `// Fix the bug in this function
// DO NOT MODIFY THE MAIN FUNCTION

#include <iostream>
using namespace std;

string checkEvenOdd(int n) {
    if (n % 2 == 1)  // Bug: should be == 0 for even
        return "Even";
    else
        return "Odd";
}

int main() {
    int n;
    cin >> n;
    cout << checkEvenOdd(n);
    return 0;
}`,
      java: `// Fix the bug in this function
// DO NOT MODIFY THE MAIN FUNCTION

import java.util.Scanner;

public class Main {
    public static String checkEvenOdd(int n) {
        if (n % 2 == 1)  // Bug: should be == 0 for even
            return "Even";
        else
            return "Odd";
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.println(checkEvenOdd(n));
    }
}`,
      python: `# Fix the bug in this function
# DO NOT MODIFY THE MAIN FUNCTION

def checkEvenOdd(n):
    if n % 2 == 1:  # Bug: should be == 0 for even
        return "Even"
    else:
        return "Odd"

if __name__ == "__main__":
    n = int(input().strip())
    print(checkEvenOdd(n))`
    },
    supportedLanguages: ['c', 'cpp', 'java', 'python'],
    testCases: [
      { input: '4', output: 'Even' },
      { input: '7', output: 'Odd' },
      { input: '0', output: 'Even' }
    ],
    hiddenTestCases: [
      { input: '100', output: 'Even' },
      { input: '99', output: 'Odd' }
    ],
    timeLimit: 60,
    difficulty: 'Easy',
    complexity: 'O(1)'
  },
  {
    title: 'Fix the Maximum Function',
    description: 'The following function should return the maximum of two numbers, but it has a bug. Find and fix it!\n\nDO NOT MODIFY THE MAIN FUNCTION - Only fix the maxOfTwo() function.',
    roundType: 1,
    inputFormat: 'Two numbers a and b on separate lines',
    outputFormat: 'Maximum of a and b',
    constraints: 'a, b can be any integers',
    sampleInput: '5\n3',
    sampleOutput: '5',
    bugCodeByLanguage: {
      c: `// Fix the bug in this function
// DO NOT MODIFY THE MAIN FUNCTION

#include <stdio.h>

int maxOfTwo(int a, int b) {
    // Bug: returns wrong value - fix this!
    if (a > b)
        return b;
    else
        return a;
}

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d", maxOfTwo(a, b));
    return 0;
}`,
      cpp: `// Fix the bug in this function
// DO NOT MODIFY THE MAIN FUNCTION

#include <iostream>
using namespace std;

int maxOfTwo(int a, int b) {
    // Bug: returns wrong value - fix this!
    if (a > b)
        return b;
    else
        return a;
}

int main() {
    int a, b;
    cin >> a >> b;
    cout << maxOfTwo(a, b);
    return 0;
}`,
      java: `// Fix the bug in this function
// DO NOT MODIFY THE MAIN FUNCTION

import java.util.Scanner;

public class Main {
    public static int maxOfTwo(int a, int b) {
        // Bug: returns wrong value - fix this!
        if (a > b)
            return b;
        else
            return a;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(maxOfTwo(a, b));
    }
}`,
      python: `# Fix the bug in this function
# DO NOT MODIFY THE MAIN FUNCTION

def maxOfTwo(a, b):
    # Bug: returns wrong value - fix this!
    if a > b:
        return b
    else:
        return a

if __name__ == "__main__":
    a = int(input().strip())
    b = int(input().strip())
    print(maxOfTwo(a, b))`
    },
    starterCodeByLanguage: {
      c: `// Fix the bug in this function
// DO NOT MODIFY THE MAIN FUNCTION

#include <stdio.h>

int maxOfTwo(int a, int b) {
    // Bug: returns wrong value - fix this!
    if (a > b)
        return b;
    else
        return a;
}

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d", maxOfTwo(a, b));
    return 0;
}`,
      cpp: `// Fix the bug in this function
// DO NOT MODIFY THE MAIN FUNCTION

#include <iostream>
using namespace std;

int maxOfTwo(int a, int b) {
    // Bug: returns wrong value - fix this!
    if (a > b)
        return b;
    else
        return a;
}

int main() {
    int a, b;
    cin >> a >> b;
    cout << maxOfTwo(a, b);
    return 0;
}`,
      java: `// Fix the bug in this function
// DO NOT MODIFY THE MAIN FUNCTION

import java.util.Scanner;

public class Main {
    public static int maxOfTwo(int a, int b) {
        // Bug: returns wrong value - fix this!
        if (a > b)
            return b;
        else
            return a;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(maxOfTwo(a, b));
    }
}`,
      python: `# Fix the bug in this function
# DO NOT MODIFY THE MAIN FUNCTION

def maxOfTwo(a, b):
    # Bug: returns wrong value - fix this!
    if a > b:
        return b
    else:
        return a

if __name__ == "__main__":
    a = int(input().strip())
    b = int(input().strip())
    print(maxOfTwo(a, b))`
    },
    supportedLanguages: ['c', 'cpp', 'java', 'python'],
    testCases: [
      { input: '5\n3', output: '5' },
      { input: '10\n20', output: '20' },
      { input: '-5\n-1', output: '-1' }
    ],
    hiddenTestCases: [
      { input: '100\n200', output: '200' },
      { input: '0\n0', output: '0' }
    ],
    timeLimit: 60,
    difficulty: 'Easy',
    complexity: 'O(1)'
  },
  {
    title: 'Fix the Multiplication Function',
    description: 'The following function should multiply two numbers, but it has a bug. Find and fix it! The bug is that it divides instead of multiplying.\n\nDO NOT MODIFY THE MAIN FUNCTION - Only fix the multiply() function.',
    roundType: 1,
    inputFormat: 'Two numbers a and b on separate lines',
    outputFormat: 'Product of a and b',
    constraints: 'a, b can be any integers',
    sampleInput: '6\n4',
    sampleOutput: '24',
    bugCodeByLanguage: {
      c: `// Fix the bug in this function
// DO NOT MODIFY THE MAIN FUNCTION

#include <stdio.h>

int multiply(int a, int b) {
  // should return product
  return a / b;
}

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d", multiply(a, b));
    return 0;
}`,
      cpp: `// Fix the bug in this function
// DO NOT MODIFY THE MAIN FUNCTION

#include <iostream>
using namespace std;

int multiply(int a, int b) {
  // should return product
  return a / b;
}

int main() {
    int a, b;
    cin >> a >> b;
    cout << multiply(a, b);
    return 0;
}`,
      java: `// Fix the bug in this function
// DO NOT MODIFY THE MAIN FUNCTION

import java.util.Scanner;

public class Main {
    public static int multiply(int a, int b) {
        // should return product
        return a / b;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(multiply(a, b));
    }
}`,
      python: `# Fix the bug in this function
# DO NOT MODIFY THE MAIN FUNCTION

def multiply(a, b):
    # should return product
    return a / b

if __name__ == "__main__":
    a = int(input().strip())
    b = int(input().strip())
    print(multiply(a, b))`
    },
    starterCodeByLanguage: {
      c: `// Fix the bug in this function
// DO NOT MODIFY THE MAIN FUNCTION

#include <stdio.h>

int multiply(int a, int b) {
  // should return product
  return a / b;
}

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d", multiply(a, b));
    return 0;
}`,
      cpp: `// Fix the bug in this function
// DO NOT MODIFY THE MAIN FUNCTION

#include <iostream>
using namespace std;

int multiply(int a, int b) {
  // should return product
  return a / b;
}

int main() {
    int a, b;
    cin >> a >> b;
    cout << multiply(a, b);
    return 0;
}`,
      java: `// Fix the bug in this function
// DO NOT MODIFY THE MAIN FUNCTION

import java.util.Scanner;

public class Main {
    public static int multiply(int a, int b) {
        // should return product
        return a / b;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(multiply(a, b));
    }
}`,
      python: `# Fix the bug in this function
# DO NOT MODIFY THE MAIN FUNCTION

def multiply(a, b):
    # should return product
    return a / b

if __name__ == "__main__":
    a = int(input().strip())
    b = int(input().strip())
    print(multiply(a, b))`
    },
    supportedLanguages: ['c', 'cpp', 'java', 'python'],
    testCases: [
      { input: '6\n4', output: '24' },
      { input: '5\n3', output: '15' },
      { input: '-3\n4', output: '-12' }
    ],
    hiddenTestCases: [
      { input: '10\n10', output: '100' },
      { input: '0\n5', output: '0' }
    ],
    timeLimit: 60,
    difficulty: 'Easy',
    complexity: 'O(1)'
  },
  {
    title: 'Fix the Absolute Value Function',
    description: 'The following function should return the absolute value of a number, but it has a bug. Find and fix it!\n\nDO NOT MODIFY THE MAIN FUNCTION - Only fix the absValue() function.',
    roundType: 1,
    inputFormat: 'A single integer n',
    outputFormat: 'Absolute value of n',
    constraints: 'n can be any integer',
    sampleInput: '-5',
    sampleOutput: '5',
    bugCodeByLanguage: {
      c: `// Fix the bug in this function
// DO NOT MODIFY THE MAIN FUNCTION

#include <stdio.h>

int absValue(int n) {
  // should return absolute value
  return n;
}

int main() {
    int n;
    scanf("%d", &n);
    printf("%d", absValue(n));
    return 0;
}`,
      cpp: `// Fix the bug in this function
// DO NOT MODIFY THE MAIN FUNCTION

#include <iostream>
using namespace std;

int absValue(int n) {
  // should return absolute value
  return n;
}

int main() {
    int n;
    cin >> n;
    cout << absValue(n);
    return 0;
}`,
      java: `// Fix the bug in this function
// DO NOT MODIFY THE MAIN FUNCTION

import java.util.Scanner;

public class Main {
    public static int absValue(int n) {
        // should return absolute value
        return n;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.println(absValue(n));
    }
}`,
      python: `# Fix the bug in this function
# DO NOT MODIFY THE MAIN FUNCTION

def absValue(n):
    # should return absolute value
    return n

if __name__ == "__main__":
    n = int(input().strip())
    print(absValue(n))`
    },
    starterCodeByLanguage: {
      c: `// Fix the bug in this function
// DO NOT MODIFY THE MAIN FUNCTION

#include <stdio.h>

int absValue(int n) {
  // should return absolute value
  return n;
}

int main() {
    int n;
    scanf("%d", &n);
    printf("%d", absValue(n));
    return 0;
}`,
      cpp: `// Fix the bug in this function
// DO NOT MODIFY THE MAIN FUNCTION

#include <iostream>
using namespace std;

int absValue(int n) {
  // should return absolute value
  return n;
}

int main() {
    int n;
    cin >> n;
    cout << absValue(n);
    return 0;
}`,
      java: `// Fix the bug in this function
// DO NOT MODIFY THE MAIN FUNCTION

import java.util.Scanner;

public class Main {
    public static int absValue(int n) {
        // should return absolute value
        return n;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.println(absValue(n));
    }
}`,
      python: `# Fix the bug in this function
# DO NOT MODIFY THE MAIN FUNCTION

def absValue(n):
    # should return absolute value
    return n

if __name__ == "__main__":
    n = int(input().strip())
    print(absValue(n))`
    },
    supportedLanguages: ['c', 'cpp', 'java', 'python'],
    testCases: [
      { input: '-5', output: '5' },
      { input: '10', output: '10' },
      { input: '0', output: '0' }
    ],
    hiddenTestCases: [
      { input: '-100', output: '100' },
      { input: '42', output: '42' }
    ],
    timeLimit: 60,
    difficulty: 'Easy',
    complexity: 'O(1)'
  },
  {
    title: 'Fix the Greater Than Comparison',
    description: 'The following function should return 1 if a is greater than b, otherwise 0. But it has a bug. Find and fix it!\n\nDO NOT MODIFY THE MAIN FUNCTION - Only fix the isGreater() function.',
    roundType: 1,
    inputFormat: 'Two integers a and b on separate lines',
    outputFormat: '1 if a > b, else 0',
    constraints: 'a, b are integers',
    sampleInput: '10\n5',
    sampleOutput: '1',
    bugCodeByLanguage: {
      c: `// Fix the bug in this function
// DO NOT MODIFY THE MAIN FUNCTION

#include <stdio.h>

int isGreater(int a, int b) {
  // should return 1 if a > b, else 0
  if (a < b)
    return 1;
  else
    return 0;
}

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d", isGreater(a, b));
    return 0;
}`,
      cpp: `// Fix the bug in this function
// DO NOT MODIFY THE MAIN FUNCTION

#include <iostream>
using namespace std;

int isGreater(int a, int b) {
  // should return 1 if a > b, else 0
  if (a < b)
    return 1;
  else
    return 0;
}

int main() {
    int a, b;
    cin >> a >> b;
    cout << isGreater(a, b);
    return 0;
}`,
      java: `// Fix the bug in this function
// DO NOT MODIFY THE MAIN FUNCTION

import java.util.Scanner;

public class Main {
    public static int isGreater(int a, int b) {
        // should return 1 if a > b, else 0
        if (a < b)
            return 1;
        else
            return 0;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(isGreater(a, b));
    }
}`,
      python: `# Fix the bug in this function
# DO NOT MODIFY THE MAIN FUNCTION

def isGreater(a, b):
    # should return 1 if a > b, else 0
    if a < b:
        return 1
    else:
        return 0

if __name__ == "__main__":
    a = int(input().strip())
    b = int(input().strip())
    print(isGreater(a, b))`
    },
    starterCodeByLanguage: {
      c: `// Fix the bug in this function
// DO NOT MODIFY THE MAIN FUNCTION

#include <stdio.h>

int isGreater(int a, int b) {
  // should return 1 if a > b, else 0
  if (a < b)
    return 1;
  else
    return 0;
}

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d", isGreater(a, b));
    return 0;
}`,
      cpp: `// Fix the bug in this function
// DO NOT MODIFY THE MAIN FUNCTION

#include <iostream>
using namespace std;

int isGreater(int a, int b) {
  // should return 1 if a > b, else 0
  if (a < b)
    return 1;
  else
    return 0;
}

int main() {
    int a, b;
    cin >> a >> b;
    cout << isGreater(a, b);
    return 0;
}`,
      java: `// Fix the bug in this function
// DO NOT MODIFY THE MAIN FUNCTION

import java.util.Scanner;

public class Main {
    public static int isGreater(int a, int b) {
        // should return 1 if a > b, else 0
        if (a < b)
            return 1;
        else
            return 0;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(isGreater(a, b));
    }
}`,
      python: `# Fix the bug in this function
# DO NOT MODIFY THE MAIN FUNCTION

def isGreater(a, b):
    # should return 1 if a > b, else 0
    if a < b:
        return 1
    else:
        return 0

if __name__ == "__main__":
    a = int(input().strip())
    b = int(input().strip())
    print(isGreater(a, b))`
    },
    supportedLanguages: ['c', 'cpp', 'java', 'python'],
    testCases: [
      { input: '10\n5', output: '1' },
      { input: '3\n8', output: '0' },
      { input: '5\n5', output: '0' }
    ],
    hiddenTestCases: [
      { input: '100\n50', output: '1' },
      { input: '-5\n-10', output: '1' }
    ],
    timeLimit: 60,
    difficulty: 'Easy',
    complexity: 'O(1)'
  },
  // Round 2 - Coding Problems
  {
    title: 'Factorial',
    description: 'Write a function that returns the factorial of a given number n. factorial(n) = n * (n-1) * (n-2) * ... * 1. Note: factorial(0) = 1\n\nDO NOT MODIFY THE MAIN FUNCTION - Only write the factorial() function.',
    roundType: 2,
    inputFormat: 'A single integer n (0 <= n <= 20)',
    outputFormat: 'The factorial of n',
    constraints: '0 <= n <= 20',
    sampleInput: '5',
    sampleOutput: '120',
    starterCodeByLanguage: {
      c: `// Write a function that returns the factorial of a number
// DO NOT MODIFY THE MAIN FUNCTION

#include <stdio.h>

long long factorial(int n) {
  // your code here
}

int main() {
    int n;
    scanf("%d", &n);
    printf("%lld", factorial(n));
    return 0;
}`,
      cpp: `// Write a function that returns the factorial of a number
// DO NOT MODIFY THE MAIN FUNCTION

#include <iostream>
using namespace std;

long long factorial(int n) {
  // your code here
}

int main() {
    int n;
    cin >> n;
    cout << factorial(n);
    return 0;
}`,
      java: `// Write a function that returns the factorial of a number
// DO NOT MODIFY THE MAIN FUNCTION

import java.util.Scanner;

public class Main {
    public static long factorial(int n) {
        // your code here
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.println(factorial(n));
    }
}`,
      python: `# Write a function that returns the factorial of a number
# DO NOT MODIFY THE MAIN FUNCTION

def factorial(n):
    # your code here
    pass

if __name__ == "__main__":
    n = int(input().strip())
    print(factorial(n))`
    },
    supportedLanguages: ['c', 'cpp', 'java', 'python'],
    testCases: [
      { input: '5', output: '120' },
      { input: '0', output: '1' },
      { input: '10', output: '3628800' }
    ],
    hiddenTestCases: [
      { input: '20', output: '2432902008176640000' },
      { input: '1', output: '1' }
    ],
    timeLimit: 120,
    difficulty: 'Easy',
    complexity: 'O(n)'
  },
  {
    title: 'Fibonacci Number',
    description: 'Write a function that returns the nth Fibonacci number. F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2)\n\nDO NOT MODIFY THE MAIN FUNCTION - Only write the fibonacci() function.',
    roundType: 2,
    inputFormat: 'A single integer n (0 <= n <= 30)',
    outputFormat: 'The nth Fibonacci number',
    constraints: '0 <= n <= 30',
    sampleInput: '10',
    sampleOutput: '55',
    starterCodeByLanguage: {
      c: `// Write a function that returns the nth Fibonacci number
// DO NOT MODIFY THE MAIN FUNCTION

#include <stdio.h>

long long fibonacci(int n) {
  // your code here
}

int main() {
    int n;
    scanf("%d", &n);
    printf("%lld", fibonacci(n));
    return 0;
}`,
      cpp: `// Write a function that returns the nth Fibonacci number
// DO NOT MODIFY THE MAIN FUNCTION

#include <iostream>
using namespace std;

long long fibonacci(int n) {
  // your code here
}

int main() {
    int n;
    cin >> n;
    cout << fibonacci(n);
    return 0;
}`,
      java: `// Write a function that returns the nth Fibonacci number
// DO NOT MODIFY THE MAIN FUNCTION

import java.util.Scanner;

public class Main {
    public static long fibonacci(int n) {
        // your code here
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.println(fibonacci(n));
    }
}`,
      python: `# Write a function that returns the nth Fibonacci number
# DO NOT MODIFY THE MAIN FUNCTION

def fibonacci(n):
    # your code here
    pass

if __name__ == "__main__":
    n = int(input().strip())
    print(fibonacci(n))`
    },
    supportedLanguages: ['c', 'cpp', 'java', 'python'],
    testCases: [
      { input: '10', output: '55' },
      { input: '0', output: '0' },
      { input: '1', output: '1' }
    ],
    hiddenTestCases: [
      { input: '30', output: '832040' },
      { input: '15', output: '610' }
    ],
    timeLimit: 120,
    difficulty: 'Easy',
    complexity: 'O(n)'
  },
  {
    title: 'Prime Number Check',
    description: 'Write a function that returns 1 if n is a prime number, otherwise returns 0.\n\nDO NOT MODIFY THE MAIN FUNCTION - Only write the isPrime() function.',
    roundType: 2,
    inputFormat: 'A single integer n (2 <= n <= 10000)',
    outputFormat: '1 if prime, 0 otherwise',
    constraints: '2 <= n <= 10000',
    sampleInput: '7',
    sampleOutput: '1',
    starterCodeByLanguage: {
      c: `// Write a function that returns 1 if n is prime, 0 otherwise
// DO NOT MODIFY THE MAIN FUNCTION

#include <stdio.h>

int isPrime(int n) {
  // your code here
}

int main() {
    int n;
    scanf("%d", &n);
    printf("%d", isPrime(n));
    return 0;
}`,
      cpp: `// Write a function that returns 1 if n is prime, 0 otherwise
// DO NOT MODIFY THE MAIN FUNCTION

#include <iostream>
using namespace std;

int isPrime(int n) {
  // your code here
}

int main() {
    int n;
    cin >> n;
    cout << isPrime(n);
    return 0;
}`,
      java: `// Write a function that returns 1 if n is prime, 0 otherwise
// DO NOT MODIFY THE MAIN FUNCTION

import java.util.Scanner;

public class Main {
    public static int isPrime(int n) {
        // your code here
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.println(isPrime(n));
    }
}`,
      python: `# Write a function that returns 1 if n is prime, 0 otherwise
# DO NOT MODIFY THE MAIN FUNCTION

def isPrime(n):
    # your code here
    pass

if __name__ == "__main__":
    n = int(input().strip())
    print(isPrime(n))`
    },
    supportedLanguages: ['c', 'cpp', 'java', 'python'],
    testCases: [
      { input: '7', output: '1' },
      { input: '4', output: '0' },
      { input: '2', output: '1' }
    ],
    hiddenTestCases: [
      { input: '100', output: '0' },
      { input: '97', output: '1' }
    ],
    timeLimit: 120,
    difficulty: 'Easy',
    complexity: 'O(sqrt(n))'
  }
];

const seedDB = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/fix-solve';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing problems
    await Problem.deleteMany({});
    console.log('Cleared existing problems');

    // Insert new problems
    await Problem.insertMany(problems);
    console.log('Seeded problems successfully');

    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
