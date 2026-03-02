const axios = require('axios');

const code = `def add(a, b):
    return a + b

if __name__ == "__main__":
    import sys
    data = sys.stdin.read().strip().split()
    a, b = int(data[0]), int(data[1])
    print(add(a, b))`;

const data = {
  problemId: "69a59a5328219740d5fd2047",
  code: code,
  language: "python",
  userId: "69a598007df184253dc2daf0"
};

axios.post('http://localhost:3000/api/submissions', data)
  .then(res => {
    console.log(JSON.stringify(res.data, null, 2));
  })
  .catch(err => {
    console.error('Error:', err.response?.data || err.message);
  });
