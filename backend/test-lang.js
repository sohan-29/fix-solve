const { runAllTestCases } = require('./utils/judge0Client');

const problems = {
  c: {
    sum: { 
      code: '#include <stdio.h>\nint add(int a, int b) { return a + b; }\nint main() { int a,b; scanf("%d%d",&a,&b); printf("%d", add(a,b)); return 0; }', 
      tests: [{input:'5\n3', output:'8'}, {input:'10\n20', output:'30'}, {input:'-5\n5', output:'0'}] 
    },
    max: { 
      code: '#include <stdio.h>\nint maxOfTwo(int a, int b) { return a > b ? a : b; }\nint main() { int a,b; scanf("%d%d",&a,&b); printf("%d", maxOfTwo(a,b)); return 0; }', 
      tests: [{input:'5\n3', output:'5'}, {input:'10\n20', output:'20'}, {input:'-5\n-1', output:'-1'}] 
    },
    evenodd: { 
      code: '#include <stdio.h>\nconst char* checkEvenOdd(int n) { return n % 2 == 0 ? "Even" : "Odd"; }\nint main() { int n; scanf("%d",&n); printf("%s", checkEvenOdd(n)); return 0; }', 
      tests: [{input:'4', output:'Even'}, {input:'7', output:'Odd'}, {input:'0', output:'Even'}] 
    }
  },
  cpp: {
    sum: { 
      code: '#include <iostream>\nusing namespace std;\nint add(int a, int b) { return a + b; }\nint main() { int a,b; cin >> a >> b; cout << add(a,b); return 0; }', 
      tests: [{input:'5\n3', output:'8'}, {input:'10\n20', output:'30'}, {input:'-5\n5', output:'0'}] 
    },
    max: { 
      code: '#include <iostream>\nusing namespace std;\nint maxOfTwo(int a, int b) { return a > b ? a : b; }\nint main() { int a,b; cin >> a >> b; cout << maxOfTwo(a,b); return 0; }', 
      tests: [{input:'5\n3', output:'5'}, {input:'10\n20', output:'20'}, {input:'-5\n-1', output:'-1'}] 
    },
    evenodd: { 
      code: '#include <iostream>\nusing namespace std;\nstring checkEvenOdd(int n) { return n % 2 == 0 ? "Even" : "Odd"; }\nint main() { int n; cin >> n; cout << checkEvenOdd(n); return 0; }', 
      tests: [{input:'4', output:'Even'}, {input:'7', output:'Odd'}, {input:'0', output:'Even'}] 
    }
  },
  java: {
    sum: { 
      code: 'import java.util.Scanner;\npublic class Main {\n    public static int add(int a, int b) { return a + b; }\n    public static void main(String[] args) { Scanner sc = new Scanner(System.in); int a = sc.nextInt(); int b = sc.nextInt(); System.out.print(add(a, b)); }\n}', 
      tests: [{input:'5\n3', output:'8'}, {input:'10\n20', output:'30'}, {input:'-5\n5', output:'0'}] 
    },
    max: { 
      code: 'import java.util.Scanner;\npublic class Main {\n    public static int maxOfTwo(int a, int b) { return a > b ? a : b; }\n    public static void main(String[] args) { Scanner sc = new Scanner(System.in); int a = sc.nextInt(); int b = sc.nextInt(); System.out.print(maxOfTwo(a, b)); }\n}', 
      tests: [{input:'5\n3', output:'5'}, {input:'10\n20', output:'20'}, {input:'-5\n-1', output:'-1'}] 
    },
    evenodd: { 
      code: 'import java.util.Scanner;\npublic class Main {\n    public static String checkEvenOdd(int n) { return n % 2 == 0 ? "Even" : "Odd"; }\n    public static void main(String[] args) { Scanner sc = new Scanner(System.in); int n = sc.nextInt(); System.out.print(checkEvenOdd(n)); }\n}', 
      tests: [{input:'4', output:'Even'}, {input:'7', output:'Odd'}, {input:'0', output:'Even'}] 
    }
  },
  python: {
    sum: { 
      code: 'def add(a, b):\n    return a + b\nif __name__ == "__main__":\n    a = int(input().strip())\n    b = int(input().strip())\n    print(add(a, b))', 
      tests: [{input:'5\n3', output:'8'}, {input:'10\n20', output:'30'}, {input:'-5\n5', output:'0'}] 
    },
    max: { 
      code: 'def maxOfTwo(a, b):\n    return a if a > b else b\nif __name__ == "__main__":\n    a = int(input().strip())\n    b = int(input().strip())\n    print(maxOfTwo(a, b))', 
      tests: [{input:'5\n3', output:'5'}, {input:'10\n20', output:'20'}, {input:'-5\n-1', output:'-1'}] 
    },
    evenodd: { 
      code: 'def checkEvenOdd(n):\n    return "Even" if n % 2 == 0 else "Odd"\nif __name__ == "__main__":\n    n = int(input().strip())\n    print(checkEvenOdd(n))', 
      tests: [{input:'4', output:'Even'}, {input:'7', output:'Odd'}, {input:'0', output:'Even'}] 
    }
  }
};

async function testAll() {
  console.log('=== Testing All Languages ===\n');
  let allPassed = true;
  
  for (const lang of ['c', 'cpp', 'java', 'python']) {
    console.log('=== ' + lang.toUpperCase() + ' ===');
    for (const [probName, prob] of Object.entries(problems[lang])) {
      const result = await runAllTestCases(prob.code, lang, prob.tests);
      const pass = result.summary.allPassed ? '✓' : '✗';
      if (!result.summary.allPassed) allPassed = false;
      console.log(probName + ': ' + pass + ' (' + result.summary.passed + '/' + result.summary.total + ')');
    }
    console.log('');
  }
  
  if (allPassed) {
    console.log('=== ALL TESTS PASSED ✓ ===');
  } else {
    console.log('=== SOME TESTS FAILED ✗ ===');
  }
  
  process.exit(allPassed ? 0 : 1);
}

testAll();
