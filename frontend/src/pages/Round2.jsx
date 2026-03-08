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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const { warnings, isLockedOut, MAX_WARNINGS } = useAntiCheat(userId);
  const timerFetchedRef = useRef(false);
  const timerRef = useRef(null);
  const resultScrollRef = useRef(null);

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

  const fetchTimer = async () => {
    try {
      const res = await axios.get(`/users/${userId}/timer?round=2`);
      const { remaining, duration, timerStart } = res.data;
      setTimerDuration(duration || 2700);
      setElapsedTime(remaining);
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

  const checkLockStatus = async () => {
    try {
      const res = await axios.get(`/users/${userId}`);
      setIsLocked(res.data.isLockedOut || false);
      if (!res.data.isApproved && !res.data.isLockedOut) {
        navigate('/instructions');
      }
    } catch (err) {
      console.error('Error checking lock status:', err);
    }
  };

  const fetchSubmittedCode = async (problemId) => {
    try {
      const res = await axios.get(`/users/${userId}`);
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
      const res = await axios.get(`/problems/round/2?language=${language}`);
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
      await checkLockStatus();
      if (sessionStorage.getItem('isLocked') === 'true') {
        setIsLocked(true);
      }
      // First fetch timer to check if it already exists
      const timerData = await fetchTimer();
      
      // Only start timer if it doesn't already exist
      if (!timerData || !timerData.timerStart) {
        try {
          await axios.post(`/users/${userId}/timer/start`, { round: 2, duration: 2700 });
          // Fetch again after starting to get updated timer
          await fetchTimer();
        } catch (err) {
          console.error('Error starting timer:', err);
        }
      }
      
      await fetchProblems(selectedLanguage);
    };
    init();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!loading && timerFetchedRef.current) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timerRef.current = setInterval(() => {
        axios.get(`/users/${userId}/timer?round=2`)
          .then(res => {
            const { remaining, isExpired } = res.data;
            setElapsedTime(remaining);
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

  // Auto-scroll to results when they appear
  useEffect(() => {
    if (submissionResult && resultScrollRef.current) {
      setTimeout(() => {
        resultScrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [submissionResult]);

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

  const handleLanguageChange = async (e) => {
    const newLang = e.target.value;
    const currentProblemIndex = selectedProblemIndex;
    const currentProblem = problems[currentProblemIndex];
    setSelectedLanguage(newLang);
    try {
      const res = await axios.get(`/problems/round/2?language=${newLang}`);
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

  const disableCopyPaste = (e) => {
    e.preventDefault();
    alert('Copy/Paste is disabled during the contest!');
  };

  useEffect(() => {
    const enterFullscreen = () => {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.log('Could not enter fullscreen:', err);
        });
      }
    };
    const timer = setTimeout(enterFullscreen, 1000);
    return () => clearTimeout(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleRun = async () => {
    setIsSubmitting(true);
    setSubmissionResult(null);
    try {
      const res = await axios.post('/submissions', {
        problemId: problem?._id || null,
        code,
        language: selectedLanguage,
        userId,
        round: 2,
        isRun: true
      });
      const result = res.data;
      console.log('Run result:', result);
      const isVisiblePassed = result.result?.summary?.visiblePassed === true || result.visibleTestPassed === true;
      const status = isVisiblePassed ? 'Accepted' : 'Wrong Answer';
      setSubmissionResult({
        ...result,
        status: status,
        isRun: true,
        result: result.result || {
          summary: {
            visiblePassed: isVisiblePassed,
            hiddenPassed: false,
            totalMarks: result.marks || 10,
            earnedMarks: result.marks || 0,
            negativeMarks: 0,
            finalScore: result.marks || 0
          },
          visible: {
            results: result.result?.visible?.results || []
          }
        }
      });
    } catch (err) {
      console.error('Run error:', err);
      setSubmissionResult({ 
        error: 'Run failed', 
        message: err.response?.data?.message || err.message, 
        isRun: true,
        status: 'Error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('userName');
      const res = await axios.post('/submissions', {
        problemId: problem?._id || null,
        code,
        language: selectedLanguage,
        userId,
        round: 2,
        isRun: false
      });
      const result = res.data;
      const status = result.result?.summary?.allPassed ? 'Accepted' : result.status;
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
          await axios.post('/contests/end', { name: userName, round: 2, timeTaken: total });
          navigate('/round-complete', { state: { timeTaken: elapsed, mistakes: totalMistakes, penalty, round: 2 } });
        } else {
          const nextIndex = problems.findIndex(p => !newSolvedProblems.has(p._id));
          if (nextIndex !== -1) {
            setTimeout(() => {
              handleProblemSelect(nextIndex);
            }, 2000);
          }
        }
      } else {
        const newMistakes = mistakes + 1;
        setMistakes(newMistakes);
        setTotalMistakes(totalMistakes + 1);
      }
    } catch (err) {
      console.error(err);
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      setTotalMistakes(totalMistakes + 1);
      setSubmissionResult({ error: 'Submission failed', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) { return <div className="container">Loading problem...</div>; }

  if (isLocked || isLockedOut) {
    return (
      <div className="lockout-overlay">
        <div className="lockout-content">
          <h2>🚫 You Have Been Locked Out</h2>
          <p>Multiple tab switches were detected. Your session has been terminated.</p>
          <p>Please contact a coordinator if you believe this is an error.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="round-page" onContextMenu={disableCopyPaste}>
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
              contextmenu: false,
              readOnly: false,
              padding: { top: 10, bottom: 10 },
              fontFamily: "'Courier New', Courier, monospace",
            }}
          />
        </div>

        {isSubmitting && (
          <div className="submission-loading">
            <div className="loading-spinner"></div>
            <p>Processing your code...</p>
          </div>
        )}
        
        <div className="round-actions">
          <button onClick={handleRun} disabled={isSubmitting} className="run-btn">Run</button>
          <button onClick={handleSubmit} disabled={isSubmitting} className="submit-btn">Submit</button>
          <button onClick={() => setCode(problem?.starterCode || '')} disabled={isSubmitting}>Reset Code</button>
        </div>

        {submissionResult && (
          <div className="submission-result" ref={resultScrollRef}>
            <h4>{submissionResult.isRun ? 'Run Result' : 'Submission Result'}</h4>
            <div className={`result-status ${submissionResult.status === 'Accepted' ? 'success' : 'error'}`}>
              Status: {submissionResult.status}
            </div>

            {submissionResult.result?.summary && (
              <div className="result-summary">
                <p><strong>Marks:</strong> {submissionResult.marks || 0} / {submissionResult.result.summary.totalMarks || 10}</p>
                <p><strong>Visible Tests:</strong> {submissionResult.result.summary.visiblePassed ? '✓ Passed' : '✗ Failed'}</p>
                
                {!submissionResult.isRun && (
                  <p><strong>Hidden Tests:</strong> {submissionResult.result.summary.hiddenPassed ? '✓ Passed' : '✗ Failed'}</p>
                )}
                
                {!submissionResult.isRun && submissionResult.negativeMarks > 0 && (
                  <p className="negative-marks"><strong>Negative Marks:</strong> -{submissionResult.negativeMarks}</p>
                )}
                
                {submissionResult.isRun && (
                  <p className="run-note" style={{ color: '#666', fontStyle: 'italic' }}>
                    Note: Run does not affect your score or negative marks.
                  </p>
                )}
              </div>
            )}

            {/* Always show test case results, not just failures */}
            {submissionResult.result?.visible?.results && submissionResult.result.visible.results.length > 0 && (
              <div className="test-case-results">
                <h5>Test Case Results:</h5>
                {submissionResult.result.visible.results.map((tc, index) => (
                  <div key={index} style={{ 
                    marginBottom: '15px', 
                    padding: '10px', 
                    borderRadius: '4px', 
                    background: tc.isPassed ? '#1a3320' : '#331a1a',
                    border: tc.isPassed ? '1px solid #00ff00' : '1px solid #ff6b6b'
                  }}>
                    <p style={{ marginBottom: '8px' }}>
                      <strong>Test Case {tc.testCaseNumber}:</strong> 
                      <span style={{ marginLeft: '10px', color: tc.isPassed ? '#00ff00' : '#ff6b6b' }}>
                        {tc.isPassed ? '✓ Passed' : '✗ Failed'}
                      </span>
                    </p>
                    <div className="case-detail">
                      <span className="label">Input:</span>
                      <pre style={{ background: '#0d0d0d', padding: '5px', margin: 0 }}>{tc.input || '(no input)'}</pre>
                    </div>
                    <div className="case-detail">
                      <span className="label">Expected:</span>
                      <pre style={{ background: '#0d1a0d', color: '#00ff00', padding: '5px', margin: 0 }}>{tc.expectedOutput || '(empty)'}</pre>
                    </div>
                    <div className="case-detail">
                      <span className="label">Got:</span>
                      <pre style={{ background: '#1a0d0d', color: '#ff6b6b', padding: '5px', margin: 0 }}>{tc.actualOutput || '(empty)'}</pre>
                    </div>
                    {tc.compile_output && (
                      <div className="case-detail">
                        <span className="label">Error:</span>
                        <pre style={{ color: '#ff6b6b', padding: '5px', margin: 0 }}>{tc.compile_output}</pre>
                      </div>
                    )}
                  </div>
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
