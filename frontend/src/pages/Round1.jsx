import { useEffect, useState, useRef } from 'react';
import axios from '../api';
import { useNavigate } from 'react-router-dom';
import useAntiCheat from '../hooks/useAntiCheat';

// Language options with display names
const LANGUAGES = [
  { id: 'c', name: 'C' },
  { id: 'cpp', name: 'C++' },
  { id: 'java', name: 'Java' },
  { id: 'python', name: 'Python' },
  { id: 'javascript', name: 'JavaScript' },
];

export default function Round1() {
  const [code, setCode] = useState('');
  const [problems, setProblems] = useState([]);
  const [problem, setProblem] = useState(null);
  const [selectedProblemIndex, setSelectedProblemIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('c');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [solvedProblems, setSolvedProblems] = useState(new Set());
  const [totalMistakes, setTotalMistakes] = useState(0);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const { warnings, isLockedOut, MAX_WARNINGS } = useAntiCheat(userId);

  // Format time as h:m:s
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Fetch problems with selected language
  const fetchProblems = async (language) => {
    try {
      const res = await axios.get(`/api/problems/round/1?language=${language}`);
      const problemsData = res.data;

      // Handle both array and single object responses
      const problemsArray = Array.isArray(problemsData) ? problemsData : [problemsData];
      setProblems(problemsArray);

      if (problemsArray.length > 0) {
        setProblem(problemsArray[0]);
        setCode(problemsArray[0].starterCode || '');
      }
      setStartTime(Date.now());
    } catch (err) {
      console.error('Error fetching problems:', err);
      alert('Failed to load problems. Please refresh the page.');
      setStartTime(Date.now());
    } finally {
      setLoading(false);
    }
  };

  // Handle problem selection
  const handleProblemSelect = (index) => {
    setSelectedProblemIndex(index);
    if (problems[index]) {
      setProblem(problems[index]);
      setCode(problems[index].starterCode || '');
      setMistakes(0);
    }
  };

  useEffect(() => {
    fetchProblems(selectedLanguage);
  }, []);

  // Timer effect
  useEffect(() => {
    if (!loading && startTime) {
      const timer = setInterval(() => {
        setElapsedTime((Date.now() - startTime) / 1000);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [loading, startTime]);

  // Handle language change - fetch new code for selected language
  const handleLanguageChange = async (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    setLoading(true);
    await fetchProblems(newLang);
  };

  // Prevent copy/paste
  const handleCopyPaste = (e) => {
    e.preventDefault();
    alert('Copy/Paste is not allowed during the contest!');
  };

  // Toggle fullscreen
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
        // Mark this problem as solved
        const newSolvedProblems = new Set(solvedProblems);
        newSolvedProblems.add(problem._id);
        setSolvedProblems(newSolvedProblems);

        // Check if all problems are solved
        const allSolved = problems.every(p => newSolvedProblems.has(p._id));

        if (allSolved) {
          // All problems solved - go to round completion
          const elapsed = (Date.now() - startTime) / 1000;
          const penalty = totalMistakes * 5;
          const total = elapsed + penalty;
          await axios.post('/api/contests/end', { name: userName, round: 1, timeTaken: total });

          navigate('/round-complete', {
            state: {
              timeTaken: elapsed,
              mistakes: totalMistakes,
              penalty,
              round: 1
            }
          });
        } else {
          // Some problems still unsolved - find next unsolved problem
          alert('Correct! Moving to next problem...');

          // Find next unsolved problem
          const nextIndex = problems.findIndex(p => !newSolvedProblems.has(p._id));
          if (nextIndex !== -1) {
            handleProblemSelect(nextIndex);
          }
        }
      } else {
        const newMistakes = mistakes + 1;
        setMistakes(newMistakes);
        setTotalMistakes(totalMistakes + 1);

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
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      setTotalMistakes(totalMistakes + 1);
      alert('Submission failed');
    }
  };

  if (loading) {
    return <div className="container">Loading problem...</div>;
  }

  return (
    <div className="round-page" onContextMenu={handleCopyPaste}>
      <div className="round-header">
        <h2>Round 1 - Debug the Code</h2>
        <div className="timer">
          Time: {formatTime(elapsedTime)} | Mistakes: {totalMistakes} | Solved: {solvedProblems.size}/{problems.length}
        </div>
        <button onClick={toggleFullscreen} className="fullscreen-btn">
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
      </div>

      {/* Anti-cheat warning banner */}
      {warnings > 0 && !isLockedOut && (
        <div className="warning-banner">
          ⚠️ Warning! Tab switch detected. If you switch again you will be <strong>locked out</strong>.
        </div>
      )}

      {/* Lockout overlay */}
      {isLockedOut && (
        <div className="lockout-overlay">
          <div className="lockout-content">
            <h2>🚫 You Have Been Locked Out</h2>
            <p>Multiple tab switches were detected. Your session has been terminated.</p>
            <p>Please contact a coordinator if you believe this is an error.</p>
          </div>
        </div>
      )}

      {/* Problem Selector */}
      {problems.length > 1 && (
        <div className="problem-selector">
          <label htmlFor="problem-select">Select Problem: </label>
          <select
            id="problem-select"
            value={selectedProblemIndex}
            onChange={(e) => handleProblemSelect(parseInt(e.target.value))}
          >
            {problems.map((p, index) => (
              <option key={p._id || index} value={index}>
                {solvedProblems.has(p._id) ? '✓ ' : '○ '}{p.title}
              </option>
            ))}
          </select>
        </div>
      )}

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

        {/* Language Selector */}
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
