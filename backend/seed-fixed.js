const mongoose = require('mongoose');
require('dotenv').config();

const Problem = require('./models/problem');

const problems = [
  // Round 1 - Debugging Problems
  {
    title: 'Fix the Sum Function',
    description: 'The following function should return the sum of two numbers, but it has a bug. Find and fix it! The bug is that it subtracts instead of adding.',
    roundType: 1,
    inputFormat: 'Two numbers a and b on separate lines',
    outputFormat: 'Sum of a and b',
    constraints: 'a, b can be any integers',
    sampleInput: '5\n3',
    sampleOutput: '8',
    bugCode: `// Fix the bug in this function
#include <stdio.h>

int add(int a, int b) {
  // should return sum
  return a - b;
}`,
    bugCodeByLanguage: {
      c: `// Fix the bug in this function
#include <stdio.h>

int add(int a, int b) {
  // should return sum
  return a - b;
}`,
      cpp: `// Fix the bug in this function
#include <iostream>
using namespace std;

int add(int a, int b) {
  // should return sum
  return a - b;
}`,
      java: `// Fix the bug in this function
import java.util.Scanner;

public class Main {
    public static int add(int a, int b) {
        return a - b;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.print(add(a, b));
    }
}`,
      python: `def add(a, b):
    return a - b

if __name__ == "__main__":
    a = int(input())
    b = int(input())
    print(add(a, b))`
    },
    starterCode: `// Fix the bug in this function
#include <stdio.h>

int add(int a, int b) {
  // should return sum
  return a - b;
}`,
    starterCodeByLanguage: {
      c: `// Fix the bug in this function
#include <stdio.h>

int add(int a, int b) {
  // should return sum
  return a - b;
}`,
      cpp: `// Fix the bug in this function
#include <iostream>
using namespace std;

int add(int a, int b) {
  // should return sum
  return a - b;
}`,
      java: `// Fix the bug in this function
import java.util.Scanner;

public class Main {
    public static int add(int a, int b) {
        return a - b;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.print(add(a, b));
    }
}`,
      python: `def add(a, b):
    return a - b

if __name__ == "__main__":
    a = int(input())
    b = int(input())
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
    description: 'The following function should return "Even" if the number is even and "Odd" if the number is odd. But it has a bug. Find and fix it!',
    roundType: 1,
    inputFormat: 'A single integer n',
    outputFormat: 'Even or Odd',
    constraints: 'n can be any integer',
    sampleInput: '4',
    sampleOutput: 'Even',
    bugCodeByLanguage: {
      c: `// Fix the bug in this function
#include <stdio.h>

const char* checkEvenOdd(int n) {
    if (n % 2 == 1)
        return "Even";
    else
        return "Odd";
}`,
      cpp: `// Fix the bug in this function
#include <iostream>
using namespace std;

string checkEvenOdd(int n) {
    if (n % 2 == 1)
        return "Even";
    else
        return "Odd";
}`,
      java: `// Fix the bug in this function
import java.util.Scanner;

public class Main {
    public static String checkEvenOdd(int n) {
        if (n % 2 == 1)
            return "Even";
        else
            return "Odd";
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.print(checkEvenOdd(n));
    }
}`,
      python: `def checkEvenOdd(n):
    if n % 2 == 1:
        return "Even"
    else:
        return "Odd"

if __name__ == "__main__":
    n = int(input())
    print(checkEvenOdd(n))`
    },
    starterCodeByLanguage: {
      c: `// Fix the bug in this function
#include <stdio.h>

const char* checkEvenOdd(int n) {
    if (n % 2 == 1)
        return "Even";
    else
        return "Odd";
}`,
      cpp: `// Fix the bug in this function
#include <iostream>
using namespace std;

string checkEvenOdd(int n) {
    if (n % 2 == 1)
        return "Even";
    else
        return "Odd";
}`,
      java: `// Fix the bug in this function
import java.util.Scanner;

public class Main {
    public static String checkEvenOdd(int n) {
        if (n % 2 == 1)
            return "Even";
        else
            return "Odd";
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.print(checkEvenOdd(n));
    }
}`,
      python: `def checkEvenOdd(n):
    if n % 2 == 1:
        return "Even"
    else:
        return "Odd"

if __name__ == "__main__":
    n = int(input())
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
    description: 'The following function should return the maximum of two numbers, but it has a bug. Find and fix it!',
    roundType: 1,
    inputFormat: 'Two numbers a and b on separate lines',
    outputFormat: 'Maximum of a and b',
    constraints: 'a, b can be any integers',
    sampleInput: '5\n3',
    sampleOutput: '5',
    bugCodeByLanguage: {
      c: `// Fix the bug in this function
#include <stdio.h>

int maxOfTwo(int a, int b) {
    if (a > b)
        return b;
    else
        return a;
}`,
      cpp: `// Fix the bug in this function
#include <iostream>
using namespace std;

int maxOfTwo(int a, int b) {
    if (a > b)
        return b;
    else
        return a;
}`,
      java: `// Fix the bug in this function
import java.util.Scanner;

public class Main {
    public static int maxOfTwo(int a, int b) {
        if (a > b)
            return b;
        else
            return a;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.print(maxOfTwo(a, b));
    }
}`,
      python: `def maxOfTwo(a, b):
    if a > b:
        return b
    else:
        return a

if __name__ == "__main__":
    a = int(input())
    b = int(input())
    print(maxOfTwo(a, b))`
    },
    starterCodeByLanguage: {
      c: `// Fix the bug in this function
#include <stdio.h>

int maxOfTwo(int a, int b) {
    if (a > b)
        return b;
    else
        return a;
}`,
      cpp: `// Fix the bug in this function
#include <iostream>
using namespace std;

int maxOfTwo(int a, int b) {
    if (a > b)
        return b;
    else
        return a;
}`,
      java: `// Fix the bug in this function
import java.util.Scanner;

public class Main {
    public static int maxOfTwo(int a, int b) {
        if (a > b)
            return b;
        else
            return a;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.print(maxOfTwo(a, b));
    }
}`,
      python: `def maxOfTwo(a, b):
    if a > b:
        return b
    else:
        return a

if __name__ == "__main__":
    a = int(input())
    b = int(input())
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
  // Round 2 - Coding Problems
  {
    title: 'Factorial',
    description: 'Write a function that returns the factorial of a given number n.',
    roundType: 2,
    inputFormat: 'A single integer n (0 <= n <= 20)',
    outputFormat: 'The factorial of n',
    constraints: '0 <= n <= 20',
    sampleInput: '5',
    sampleOutput: '120',
    starterCodeByLanguage: {
      c: `#include <stdio.h>

long long factorial(int n) {
}`,
      cpp: `#include <iostream>
using namespace std;

long long factorial(int n) {
}`,
      java: `import java.util.Scanner;

public class Main {
    public static long factorial(int n) {
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.print(factorial(n));
    }
}`,
      python: `def factorial(n):
    pass

if __name__ == "__main__":
    n = int(input())
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
    description: 'Write a function that returns the nth Fibonacci number.',
    roundType: 2,
    inputFormat: 'A single integer n (0 <= n <= 30)',
    outputFormat: 'The nth Fibonacci number',
    constraints: '0 <= n <= 30',
    sampleInput: '10',
    sampleOutput: '55',
    starterCodeByLanguage: {
      c: `#include <stdio.h>

long long fibonacci(int n) {
}`,
      cpp: `#include <iostream>
using namespace std;

long long fibonacci(int n) {
}`,
      java: `import java.util.Scanner;

public class Main {
    public static long fibonacci(int n) {
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.print(fibonacci(n));
    }
}`,
      python: `def fibonacci(n):
    pass

if __name__ == "__main__":
    n = int(input())
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
    description: 'Write a function that returns 1 if n is a prime number, otherwise returns 0.',
    roundType: 2,
    inputFormat: 'A single integer n (2 <= n <= 10000)',
    outputFormat: '1 if prime, 0 otherwise',
    constraints: '2 <= n <= 10000',
    sampleInput: '7',
    sampleOutput: '1',
    starterCodeByLanguage: {
      c: `#include <stdio.h>

int isPrime(int n) {
}`,
      cpp: `#include <iostream>
using namespace std;

int isPrime(int n) {
}`,
      java: `import java.util.Scanner;

public class Main {
    public static int isPrime(int n) {
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.print(isPrime(n));
    }
}`,
      python: `def isPrime(n):
    pass

if __name__ == "__main__":
    n = int(input())
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
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/fix-solve';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    await Problem.deleteMany({});
    console.log('Cleared existing problems');

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
