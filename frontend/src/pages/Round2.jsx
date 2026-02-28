import { useEffect, useState } from 'react';
import axios from '../api';
import { useNavigate } from 'react-router-dom';

export default function Round2() {
  const [code, setCode] = useState('');
  const [problem, setProblem] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTestCases, setShowTestCases] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await axios.get('/api/problems/round/2');
        setProblem(res.data);
        setCode(res.data.starterCode || '');
        setStartTime(Date.now());
      } catch (err) {
        console.error('Error fetching problem:', err);
        setCode(`// Write a function that returns the factorial of a number
function factorial(n) {
  // your code here
}`);
        setStartTime(Date.now());
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, []);

  const handleSubmit = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('userName');
      
      const res = await axios.post('/api/submissions', {
        problemId: problem?._id || null,
        code,
        language: 'javascript',
        userId
      });
      
      const result = res.data;
      const status = result.result?.summary?.allPassed ? 'Accepted' : result.status;
      
      if (status === 'Accepted') {
        const elapsed = (Date.now() - startTime) / 1000;
        const penalty = mistakes * 5;
        const total = elapsed + penalty;
        await axios.post('/api/contests/end', { name: userName, round: 2, timeTaken: total });
        navigate('/results');
      } else {
        setMistakes(m => m + 1);
        if (result.result?.results) {
          const failedTest = result.result.results.find(r => !r.isPassed);
          if (failedTest) {
            alert(`Wrong Answer!\nTest Case ${failedTest.testCaseNumber}:\nInput: ${failedTest.input}\nExpected: ${failedTest.expectedOutput}\nGot: ${failedTest.actualOutput}`);
          }
        } else {
          alert('Incorrect, try again.');
        }
      }
    } catch (err) {
      console.error(err);
      setMistakes(m => m + 1);
      alert('Submission error');
    }
  };

  if (loading) {
    return <div className="container">Loading problem...</div>;
  }

  return (
    <div className="container">
      <h2>Round 2 - Solve the Problem</h2>
      
      {problem && (
        <div className="problem-description">
          <h3>{problem.title}</h3>
          <p>{problem.description}</p>
          
          {problem.inputFormat && (
            <p><strong>Input Format:</strong> {problem.inputFormat}</p>
          )}
          
          {problem.outputFormat && (
            <p><strong>Output Format:</strong> {problem.outputFormat}</p>
          )}
          
          {problem.constraints && (
            <p><strong>Constraints:</strong> {problem.constraints}</p>
          )}
          
          {problem.sampleInput && (
            <div>
              <strong>Sample Input:</strong>
              <pre style={{ background: '#f4f4f4', padding: '10px' }}>{problem.sampleInput}</pre>
            </div>
          )}
          
          {problem.sampleOutput && (
            <div>
              <strong>Sample Output:</strong>
              <pre style={{ background: '#f4f4f4', padding: '10px' }}>{problem.sampleOutput}</pre>
            </div>
          )}
          
          {problem.testCases && problem.testCases.length > 0 && (
            <button 
              onClick={() => setShowTestCases(!showTestCases)}
              style={{ marginTop: '10px' }}
            >
              {showTestCases ? 'Hide' : 'Show'} Test Cases
            </button>
          )}
          
          {showTestCases && problem.testCases && (
            <div style={{ marginTop: '10px' }}>
              <h4>Test Cases:</h4>
              {problem.testCases.map((tc, i) => (
                <div key={i} style={{ marginBottom: '10px', border: '1px solid #ddd', padding: '10px' }}>
                  <strong>Test Case {i + 1}:</strong>
                  <br />
                  Input: <pre style={{ display: 'inline' }}>{tc.input}</pre>
                  <br />
                  Output: <pre style={{ display: 'inline' }}>{tc.output}</pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      <textarea
        rows={15}
        cols={60}
        value={code}
        onChange={e => setCode(e.target.value)}
        style={{ fontFamily: 'monospace', width: '100%', marginTop: '10px' }}
      />
      
      <div style={{ marginTop: '10px' }}>
        <button onClick={handleSubmit} style={{ marginRight: '10px' }}>
          Submit
        </button>
        <button onClick={() => setCode(problem?.starterCode || '')}>
          Reset Code
        </button>
      </div>
      
      <p>Mistakes: {mistakes}</p>
    </div>
  );
}
