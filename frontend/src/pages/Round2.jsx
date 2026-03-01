import { useEffect, useState } from 'react';
import axios from '../api';
import { useNavigate } from 'react-router-dom';

export default function Round2() {
  const [code, setCode] = useState('');
  const [problem, setProblem] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
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

  // Timer effect
  useEffect(() => {
    if (!startTime || loading) return;
    
    const timer = setInterval(() => {
      setElapsedTime((Date.now() - startTime) / 1000);
    }, 100);

    return () => clearInterval(timer);
  }, [startTime, loading]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
        
        // Navigate to completion page with stats
        navigate('/round-completion', {
          state: {
            roundNumber: 2,
            timeTaken: elapsed,
            mistakes: mistakes,
            penalty: penalty
          }
        });
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
    <div className="round-page">
      <div className="round-header">
        <div className="round-title">
          <h2>Round 2 - Solve the Problem</h2>
        </div>
        <div className="round-timer">
          <span className="timer-label">Time:</span>
          <span className="timer-value">{formatTime(elapsedTime)}</span>
        </div>
        <div className="round-stats">
          <span className="mistakes-count">Mistakes: {mistakes}</span>
          <span className="penalty-info">Penalty: +{mistakes * 5}s</span>
        </div>
      </div>
      
      <div className="round-content">
        <div className="problem-description">
          {problem && (
            <>
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
              
              {problem.timeLimit && (
                <p><strong>Time Limit:</strong> {problem.timeLimit}s</p>
              )}
              
              {problem.difficulty && (
                <p><strong>Difficulty:</strong> {problem.difficulty}</p>
              )}
              
              {problem.complexity && (
                <p><strong>Expected Complexity:</strong> {problem.complexity}</p>
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
            </>
          )}
        </div>
        
        <div>
          <textarea
            rows={20}
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
        </div>
      </div>
    </div>
  );
}
