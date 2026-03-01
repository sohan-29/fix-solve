import { useEffect, useState } from 'react';
import axios from '../api';
import { useNavigate } from 'react-router-dom';

export default function Round1() {
  const [code, setCode] = useState('');
  const [problem, setProblem] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await axios.get('/api/problems/round/1');
        setProblem(res.data);
        setCode(res.data.bugCode || '');
        setStartTime(Date.now());
      } catch (err) {
        console.error('Error fetching problem:', err);
        setCode(`// Fix the bug in this function
function add(a, b) {
  // should return sum
  return a - b;
}`);
        setStartTime(Date.now());
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, []);

  // Timer effect
  useEffect(() => {
    if (!loading && startTime) {
      const timer = setInterval(() => {
        setElapsedTime(((Date.now() - startTime) / 1000).toFixed(1));
      }, 100);
      return () => clearInterval(timer);
    }
  }, [loading, startTime]);

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
        await axios.post('/api/contests/end', { name: userName, round: 1, timeTaken: total });
        
        // Navigate to completion page with stats
        navigate('/round-complete', {
          state: {
            timeTaken: elapsed,
            mistakes,
            penalty,
            round: 1
          }
        });
      } else {
        setMistakes(m => m + 1);
        // Show detailed feedback
        if (result.result?.results) {
          const failedTest = result.result.results.find(r => !r.isPassed);
          if (failedTest) {
            alert(`Wrong Answer!\nTest Case ${failedTest.testCaseNumber}:\nInput: ${failedTest.input}\nExpected: ${failedTest.expectedOutput}\nGot: ${failedTest.actualOutput}`);
          } else {
            alert('Not correct yet, try again.');
          }
        } else {
          alert('Not correct yet, try again.');
        }
      }
    } catch (err) {
      console.error(err);
      setMistakes(m => m + 1);
      alert('Submission failed');
    }
  };

  if (loading) {
    return <div className="container">Loading problem...</div>;
  }

  return (
    <div className="round-page">
      <div className="round-header">
        <h2>Round 1 - Debug the Code</h2>
        <div className="timer">
          Time: {elapsedTime}s | Mistakes: {mistakes}
        </div>
      </div>
      
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
        <button onClick={() => setCode(problem?.bugCode || '')}>
          Reset Code
        </button>
      </div>
    </div>
  );
}
