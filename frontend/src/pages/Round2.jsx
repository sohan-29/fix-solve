import { useEffect, useState, useRef } from 'react';
import axios from '../api';
import { useNavigate } from 'react-router-dom';
import useAntiCheat from '../hooks/useAntiCheat';
import Editor from '@monaco-editor/react';

const LANGUAGES = [
  { id: 'c', name: 'C' },
  { id: 'cpp', name: 'C++' },
  { id: 'java', name: 'Java' },
  { id: 'python', name: 'Python' },
];

export default function Round2() {
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
  const [showTestCases, setShowTestCases] = useState(false);
  const [solvedProblems, setSolvedProblems] = useState(new Set());
  const [totalMistakes, setTotalMistakes] = useState(0);
  const [timerDuration, setTimerDuration] = useState(2700);
  const [isLocked, setIsLocked] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const { warnings, isLockedOut, MAX_WARNINGS } = useAntiCheat(userId);
  const timerFetchedRef = useRef(false);
  const timerRef = useRef(null);

  const formatTime = (seconds) => {
    const secs = Math.max(0, Math.floor(seconds));
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  // Fetch timer from backend
  const fetchTimer = async () => {
    try {
      const res = await axios.get(`/api/users/${userId}/timer?round=2`);
      const { remaining, duration, timerStart } = res.data;
      setTimerDuration(duration || 2700);
      setElapsedTime(remaining);

      // Save to sessionStorage for persistence across refreshes
      sessionStorage.setItem('round2Remaining', remaining.toString());
      sessionStorage.setItem('round2Duration', (duration || 2700).toString());

      if (timerStart) {
        setStartTime(new Date(timerStart));
        sessionStorage.setItem('round2TimerStart', timerStart);
      }

      timerFetchedRef.current = true;
      return res.data;
    } catch (err) {
      console.error('Error fetching timer:', err);
      // Try to load from sessionStorage as fallback
      const savedRemaining = sessionStorage.getItem('round2Remaining');
      const savedDuration = sessionStorage.getItem('round2Duration');
      if (savedRemaining) {
        setElapsedTime(parseInt(savedRemaining));
        setTimerDuration(parseInt(savedDuration) || 2700);
        timerFetchedRef.current = true;
      } else {
        setElapsedTime(2700);
      }
      return null;
    }
  };

  // Check lock status on mount
  const checkLockStatus = async () => {
    try {
      const res = await axios.get(`/api/users/${userId}`);
      if (res.data.isLockedOut) {
        setIsLocked(true);
        sessionStorage.setItem('isLocked', 'true');
      }
    } catch (err) {
      console.error('Error checking lock status:', err);
    }
  };

  // Fetch submitted code for a problem
  const fetchSubmittedCode = async (problemId) => {
    try {
      const res = await axios.get(`/api/users/${userId}`);
      const userData = res.data;
      const submittedCodeMap = userData.round2SubmittedCode || {};
      return submittedCodeMap[problemId] || null;
    } catch (err) {
      console.error('Error fetching submitted code:', err);
      return null;
    }
  };

  const fetchProblems = async (language) => {
    try {
      const res = await axios.get(`/api/problems/round/2?language=${language}`);
      const problemsData = res.data;
      const problemsArray = Array.isArray(problemsData) ? problemsData : [problemsData];
      setProblems(problemsArray);
      if (problemsArray.length > 0) {
        setProblem(problemsArray[0]);
        const savedCode = await fetchSubmittedCode(problemsArray[0]._id);
        setCode(savedCode || problemsArray[0].starterCode || '');
      }
    } catch (err) {
      console.error('Error fetching problems:', err);
      alert('Failed to load problems. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      // Check lock status first
      await checkLockStatus();

      // Check session storage for lock
      if (sessionStorage.getItem('isLocked') === 'true') {
        setIsLocked(true);
      }

      try {
        await axios.post(`/api/users/${userId}/timer/start`, { round: 2, duration: 2700 });
      } catch (err) { }
      await fetchTimer();
      await fetchProblems(selectedLanguage);
    };

    init();

    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Timer effect - uses backend-controlled timer
  useEffect(() => {
    if (!loading && timerFetchedRef.current) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      timerRef.current = setInterval(() => {
        axios.get(`/api/users/${userId}/timer?round=2`)
          .then(res => {
            const { remaining, isExpired } = res.data;
            setElapsedTime(remaining);

            // Save to sessionStorage for persistence
            sessionStorage.setItem('round2Remaining', remaining.toString());

            if (isExpired) {
              alert('Time is up! Round 2 has ended.');
              navigate('/round-complete', { state: { timeTaken: timerDuration, round: 2 } });
            }
          })
          .catch(err => { console.error('Error fetching timer:', err); });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [loading, userId, timerDuration, navigate]);

  // Handle problem selection
  const handleProblemSelect = async (index) => {
    const selectedProblem = problems[index];
    if (selectedProblem) {
      setSelectedProblemIndex(index);
      setProblem(selectedProblem);
      const savedCode = await fetchSubmittedCode(selectedProblem._id);
      setCode(savedCode || selectedProblem.starterCode || '');
      setMistakes(0);
      setSubmissionResult(null);
    }
  };

  // Handle language change
  const handleLanguageChange = async (e) => {
    const newLang = e.target.value;
    const currentProblemIndex = selectedProblemIndex;
    const currentProblem = problems[currentProblemIndex];

    setSelectedLanguage(newLang);

    try {
      const res = await axios.get(`/api/problems/round/2?language=${newLang}`);
      const problemsData = res.data;
      const problemsArray = Array.isArray(problemsData) ? problemsData : [problemsData];
      setProblems(problemsArray);

      const sameProblem = problemsArray.find(p => p.title === currentProblem?.title);
      if (sameProblem) {
        const newIndex = problemsArray.findIndex(p => p.title === currentProblem.title);
        setSelectedProblemIndex(newIndex);
        setProblem(sameProblem);
        const savedCode = await fetchSubmittedCode(sameProblem._id);
        setCode(savedCode || sameProblem.starterCode || '');
      } else if (problemsArray.length > 0) {
        setSelectedProblemIndex(0);
        setProblem(problemsArray[0]);
        setCode(problemsArray[0].starterCode || '');
      }
    } catch (err) {
      console.error('Error changing language:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPaste = (e) => {
    // Copy/paste is allowed
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
        userId,
        round: 2
      });
      const result = res.data;
      const status = result.result?.summary?.allPassed ? 'Accepted' : result.status;

      // Set submission result for UI display
      setSubmissionResult(result);

      if (status === 'Accepted') {
        const newSolvedProblems = new Set(solvedProblems);
        newSolvedProblems.add(problem._id);
        setSolvedProblems(newSolvedProblems);
        const allSolved = problems.every(p => newSolvedProblems.has(p._id));
        if (allSolved) {
          const elapsed = timerDuration - elapsedTime;
          const penalty = totalMistakes * 5;
          const total = elapsed + penalty;
          await axios.post('/api/contests/end', { name: userName, round: 2, timeTaken: total });
          navigate('/round-complete', { state: { timeTaken: elapsed, mistakes: totalMistakes, penalty, round: 2 } });
        } else {
          // Show result then auto move to next problem after 2 seconds
          const nextIndex = problems.findIndex(p => !newSolvedProblems.has(p._id));
          if (nextIndex !== -1) {
            setTimeout(() => {
              handleProblemSelect(nextIndex);
            }, 2000);
          }
        }
      } else {
        // Wrong answer - keep the result visible for user to see and fix
        const newMistakes = mistakes + 1;
        setMistakes(newMistakes);
        setTotalMistakes(totalMistakes + 1);
        // Don't clear submission result - user can see what went wrong
      }
    } catch (err) {
      console.error(err);
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      setTotalMistakes(totalMistakes + 1);
      setSubmissionResult({ error: 'Submission failed', message: err.message });
    }
  };

  if (loading) { return <div className="container">Loading problem...</div>; }

  return (
    <div className="round-page" onContextMenu={handleCopyPaste}>
      {/* Lockout overlay */}
      {(isLocked || isLockedOut) && (
        <div className="lockout-overlay">
          <div className="lockout-content">
            <h2>🚫 You Have Been Locked Out</h2>
            <p>Multiple tab switches were detected. Your session has been terminated.</p>
            <p>Please contact a coordinator if you believe this is an error.</p>
          </div>
        </div>
      )}

      <div className="round-header">
        <h2>Round 2 - Solve the Problem</h2>
        <div className="timer">Time: {formatTime(elapsedTime)} | Mistakes: {totalMistakes} | Solved: {solvedProblems.size}/{problems.length}</div>
        <button onClick={toggleFullscreen} className="fullscreen-btn">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</button>
      </div>

      {warnings > 0 && !isLockedOut && <div className="warning-banner">Warning! Tab switch detected.</div>}

      {problems.length > 1 && (
        <div className="problem-selector">
          <label>Select Problem: </label>
          <select value={selectedProblemIndex} onChange={(e) => handleProblemSelect(parseInt(e.target.value))}>
            {problems.map((p, i) => (<option key={p._id || i} value={i}>{solvedProblems.has(p._id) ? '✓ ' : '○ '}{p.title}</option>))}
          </select>
        </div>
      )}

      <div className="round-content-wrapper">
        {problem && (
          <div className="problem-description">
            <h3>{problem.title}</h3>
            <p>{problem.description}</p>
            {problem.inputFormat && <p><strong>Input Format:</strong> {problem.inputFormat}</p>}
            {problem.outputFormat && <p><strong>Output Format:</strong> {problem.outputFormat}</p>}
            {problem.constraints && <p><strong>Constraints:</strong> {problem.constraints}</p>}
            {problem.sampleInput && <div><strong>Sample Input:</strong><pre style={{ background: '#f4f4f4', padding: '10px' }}>{problem.sampleInput}</pre></div>}
            {problem.sampleOutput && <div><strong>Sample Output:</strong><pre style={{ background: '#f4f4f4', padding: '10px' }}>{problem.sampleOutput}</pre></div>}
            {problem.testCases && problem.testCases.length > 0 && <button onClick={() => setShowTestCases(!showTestCases)} style={{ marginTop: '10px' }}>{showTestCases ? 'Hide' : 'Show'} Test Cases</button>}
            {showTestCases && problem.testCases && (
              <div style={{ marginTop: '10px' }}>
                <h4>Test Cases:</h4>
                {problem.testCases.map((tc, i) => (
                  <div key={i} style={{ marginBottom: '10px', border: '1px solid #ddd', padding: '10px' }}>
                    <strong>Test Case {i + 1}:</strong><br />
                    Input: <pre style={{ display: 'inline' }}>{tc.input}</pre><br />
                    Output: <pre style={{ display: 'inline' }}>{tc.output}</pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="language-selector">
          <label>Select Language: </label>
          <select id="language" value={selectedLanguage} onChange={handleLanguageChange}>
            {LANGUAGES.map(lang => (<option key={lang.id} value={lang.id}>{lang.name}</option>))}
          </select>
        </div>

        <div className="code-editor-wrapper" style={{ height: '500px', border: '1px solid #333' }}>
          <Editor
            height="100%"
            language={selectedLanguage === 'c' ? 'cpp' : selectedLanguage}
            value={code}
            theme="vs-dark"
            onChange={(value) => setCode(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              contextmenu: false, // Disable right-click menu for anti-cheat
              readOnly: false,
              padding: { top: 10, bottom: 10 },
              fontFamily: "'Courier New', Courier, monospace",
            }}
          />
        </div>

        <div className="round-actions">
          <button onClick={handleSubmit}>Submit</button>
          <button onClick={() => setCode(problem?.starterCode || '')}>Reset Code</button>
        </div>

        {/* Submission Result Display */}
        {submissionResult && (
          <div className="submission-result">
            <h4>Submission Result</h4>
            <div className={`result-status ${submissionResult.status === 'Accepted' ? 'success' : 'error'}`}>
              Status: {submissionResult.status}
            </div>

            {submissionResult.result?.summary && (
              <div className="result-summary">
                <p><strong>Marks:</strong> {submissionResult.marks || 0} / {submissionResult.result.summary.totalMarks || 10}</p>
                <p><strong>Visible Tests:</strong> {submissionResult.result.summary.visiblePassed ? '✓ Passed' : '✗ Failed'}</p>
                <p><strong>Hidden Tests:</strong> {submissionResult.result.summary.hiddenPassed ? '✓ Passed' : '✗ Failed'}</p>
                {submissionResult.negativeMarks > 0 && (
                  <p className="negative-marks"><strong>Negative Marks:</strong> -{submissionResult.negativeMarks}</p>
                )}
              </div>
            )}

            {/* Show test case failures - Expected vs Got */}
            {submissionResult.result?.visible?.results && !submissionResult.result.summary.visiblePassed && (
              <div className="test-case-failures">
                <h5>Test Case Failures:</h5>
                {submissionResult.result.visible.results.map((tc, index) => (
                  !tc.isPassed && (
                    <div key={index} className="failure-case">
                      <p><strong>Test Case {tc.testCaseNumber}:</strong></p>
                      <div className="case-detail">
                        <span className="label">Input:</span>
                        <pre>{tc.input}</pre>
                      </div>
                      <div className="case-detail">
                        <span className="label">Expected:</span>
                        <pre className="expected">{tc.expectedOutput}</pre>
                      </div>
                      <div className="case-detail">
                        <span className="label">Got:</span>
                        <pre className="got">{tc.actualOutput}</pre>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}

            {submissionResult.error && (
              <div className="error-message">
                {submissionResult.message || submissionResult.error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
