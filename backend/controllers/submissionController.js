const axios = require("axios");
const Submission = require("../models/Submission");
const Question = require("../models/Question");

exports.submitCode = async (req, res) => {
  const { userId, questionId, source_code, language_id } = req.body;

  try {
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ error: "Question not found" });

    // Send to Judge0
    const response = await axios.post(
      "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
      {
        source_code,
        language_id,
        stdin: question.testCases[0].input || "",
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": process.env.JUDGE0_KEY,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
      }
    );

    const result = response.data;

    // Save submission
    const submission = new Submission({
      user: userId,
      question: questionId,
      round: question.round,
      source_code,
      language_id,
      status: result.status.description,
      output: result.stdout,
      error: result.stderr,
    });

    await submission.save();

    // Compare output with expected
    const passed = question.testCases.every(
      (tc) => result.stdout.trim() === tc.expectedOutput.trim()
    );

    res.json({ submission, passed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Code execution failed" });
  }
};
