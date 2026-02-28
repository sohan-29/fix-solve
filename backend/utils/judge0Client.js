const axios = require('axios');

const JUDGE0_URL = process.env.JUDGE0_URL || 'http://localhost:2358';

const submitCode = async (sourceCode, languageId, stdin = '') => {
  try {
    const response = await axios.post(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
      source_code: sourceCode,
      language_id: languageId,
      stdin
    });
    return response.data;
  } catch (error) {
    throw new Error('Judge0 submission failed: ' + error.message);
  }
};

module.exports = { submitCode };
