const axios = require('axios');

const API = 'http://localhost:3000/api';

async function seed() {
  try {
    // Round 1 debugging problem with all 4 languages
    const r1 = await axios.post(`${API}/problems`, {
      title: 'Sum Two Numbers (Debug)',
      description: 'Fix the bug in the code that should read two integers and print their sum.',
      roundType: 1,
      inputFormat: 'Two integers on separate lines',
      outputFormat: 'Their sum',
      sampleInput: '5\n3',
      sampleOutput: '8',
      marks: 10,
      supportedLanguages: ['c', 'cpp', 'java', 'python'],
      bugCodeByLanguage: {
        c: '#include <stdio.h>\nint main() {\n    int a, b;\n    scanf("%d", &a);\n    scanf("%d", &b);\n    printf("%d", a - b); // BUG: should be a + b\n    return 0;\n}',
        cpp: '#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a - b; // BUG: should be a + b\n    return 0;\n}',
        java: 'import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        System.out.println(a - b); // BUG: should be a + b\n    }\n}',
        python: 'a = int(input())\nb = int(input())\nprint(a - b) # BUG: should be a + b'
      },
      testCases: [
        { input: '5\n3', output: '8' },
        { input: '10\n20', output: '30' }
      ],
      hiddenTestCases: [
        { input: '100\n200', output: '300' },
        { input: '-5\n5', output: '0' }
      ]
    });
    console.log('Round 1 problem created:', r1.data.title);

    // Round 2 coding problem with all 4 languages
    const r2 = await axios.post(`${API}/problems`, {
      title: 'Multiply Two Numbers',
      description: 'Read two integers from input and print their product.',
      roundType: 2,
      inputFormat: 'Two integers on separate lines',
      outputFormat: 'Their product',
      sampleInput: '4\n5',
      sampleOutput: '20',
      marks: 10,
      supportedLanguages: ['c', 'cpp', 'java', 'python'],
      starterCodeByLanguage: {
        c: '#include <stdio.h>\nint main() {\n    // Read two numbers and print their product\n    return 0;\n}',
        cpp: '#include <iostream>\nusing namespace std;\nint main() {\n    // Read two numbers and print their product\n    return 0;\n}',
        java: 'import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Read two numbers and print their product\n    }\n}',
        python: '# Read two numbers and print their product'
      },
      testCases: [
        { input: '4\n5', output: '20' },
        { input: '3\n7', output: '21' }
      ],
      hiddenTestCases: [
        { input: '100\n200', output: '20000' },
        { input: '-5\n5', output: '-25' }
      ]
    });
    console.log('Round 2 problem created:', r2.data.title);
    console.log('SEED COMPLETE - 2 problems added');
  } catch(e) {
    console.error('Error:', e.response?.data || e.message);
  }
}

seed();
