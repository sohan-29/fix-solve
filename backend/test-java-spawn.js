const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const className = 'Main';
const sourceCode = `import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        System.out.println(a + b);\n    }\n}`;

const tmpDir = path.join(os.tmpdir(), `java_test`);
fs.mkdirSync(tmpDir, { recursive: true });
fs.writeFileSync(path.join(tmpDir, `${className}.java`), sourceCode);

const javacWhere = spawnSync('where', ['javac'], { shell: true });
const javaWhere = spawnSync('where', ['java'], { shell: true });

const javacCmd = javacWhere.stdout.toString().split('\n')[0].trim();
const javaCmd = javaWhere.stdout.toString().split('\n')[0].trim();

console.log('javacCmd:', javacCmd);
console.log('javaCmd:', javaCmd);

console.log('Compiling...');
const compileResult = spawnSync(javacCmd, [path.join(tmpDir, `${className}.java`)], {
  encoding: 'utf-8',
  timeout: 15000,
  cwd: tmpDir,
  shell: true
});

console.log('compile stdout:', compileResult.stdout);
console.log('compile stderr:', compileResult.stderr);
console.log('compile status:', compileResult.status);

console.log('Running...');
const runResult = spawnSync(javaCmd, ['-cp', tmpDir, className], {
  input: '5\n3\n',
  timeout: 10000,
  encoding: 'utf-8',
  maxBuffer: 1024 * 1024 * 10,
  shell: true
});

console.log('run stdout:', runResult.stdout);
console.log('run stderr:', runResult.stderr);
console.log('run status:', runResult.status);
console.log('run error:', runResult.error);
