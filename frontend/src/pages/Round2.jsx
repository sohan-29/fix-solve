import { useEffect, useState } from 'react';
import axios from '../api';
import { useNavigate } from 'react-router-dom';

// Language options with display names
const LANGUAGES = [
  { id: 'c', name: 'C' },
  { id: 'cpp', name: 'C++' },
  { id: 'java', name: 'Java' },
  { id: 'python', name: 'Python' },
  { id: 'javascript', name: 'JavaScript' },
];

export default function Round2() {
  const [code, setCode] = useState('');
  const [problem, setProblem] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('c');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTestCases, setShowTestCases] = useState(false);
  const navigate = useNavigate();

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Fetch problem with selected language
  const fetchProblem = async (language) => {
    try {
      const res = await axios.get(`/api/problems/round/2?language=${language}`);
      const problemData = res.data;
      
      setProblem(problemData);
      setCode(problemData.starterCode || '');
      setStartTime(Date.now());
    } catch (err) {
      console.error('Error fetching problem:', err);
      alert('Failed to load problem. Please refresh the page.');
      setStartTime(Date.now());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblem(selectedLanguage);
  }, []);

  useEffect(() => {
    if (!loading && startTime) {
      const timer = setInterval(() => {
        setElapsedTime((Date.now() - startTime) / 1000);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [loading, startTime]);

  const handleLanguageChange = async (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    setLoading(true);
    await fetchProblem(newLang);
  };

  const handleCopyPaste = (e) => {
    e.preventDefault();
    alert('Copy/Paste is not allowed during the contest!');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('userName');
      
      const res = await axios.post('/api/submissions', {
        problemId: problem?._id || null,
        code,
        language: selectedLanguage,
        userId
      });
      
      const result = res.data;
      const status = result.result?.summary?.allPassed ? 'Accepted' : result.status;
      
      if (status === 'Accepted') {
        const elapsed = (Date.now() - startTime) / 1000;
        const penalty = mistakes * 5;
        const total = elapsed + penalty;
        await axios.post('/api/contests/end', { name: userName, round: 2, timeTaken: total });
        
        navigate('/round-complete', {
          state: {
            timeTaken: elapsed,
            mistakes,
            penalty,
            round: 2
          }
        });
      } else {
        setMistakes(m => m + 1);
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
    <div className="round-page" onContextMenu={handleCopyPaste}>
      <div className="round-header">
        <h2>Round 2 - Solve the Problem</h2>
        <div className="timer">
          Time: {formatTime(elapsedTime)} | Mistakes: {mistakes}
        </div>
        <button onClick={toggleFullscreen} className="fullscreen-btn">
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
      </div>
      
      <div className="round-content-wrapper">
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
        
        <div className="language-selector">
          <label htmlFor="language">Select Language: </label>
          <select 
            id="language" 
            value={selectedLanguage} 
            onChange={handleLanguageChange}
          >
            {LANGUAGES.map(lang => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="code-editor-wrapper">
          <textarea
            className="code-textarea"
            rows={15}
            cols={60}
            value={code}
            onChange={e => setCode(e.target.value)}
            onCopy={handleCopyPaste}
            onCut={handleCopyPaste}
            onPaste={handleCopyPaste}
            draggable={false}
          />
        </div>
        
        <div className="round-actions">
          <button onClick={handleSubmit}>
            Submit
          </button>
          <button onClick={() => setCode(problem?.starterCode || '')}>
            Reset Code
          </button>
        </div>
      </div>
    </div>
  );
}
