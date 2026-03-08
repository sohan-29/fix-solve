const axios = require('axios');

async function testSubmission() {
  // Test with FIXED code (a + b)
  const fixedCode = `def add(a, b):
    return a + b

if __name__ == "__main__":
    a = int(input())
    b = int(input())
    print(add(a, b))`;

  try {
    const res = await axios.post('http://localhost:3000/api/submissions', {
      problemId: '69ad61715f6ac2744191641a',
      code: fixedCode,
      language: 'python',
      userId: '69ad4dc29e3ad689af89b2fb',
      round: 1,
      isRun: true
    });
    console.log('=== FIXED CODE RESULT ===');
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
    if (err.response) console.error('Response:', err.response.data);
  }
}

testSubmission();
