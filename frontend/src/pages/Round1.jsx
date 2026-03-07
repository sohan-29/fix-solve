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
  const [timerDuration, setTimerDuration] = useState(1800); // Default 30 min
  const [isLocked, setIsLocked] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for submission
  const [resultRef, setResultRef] = useState(null); // Ref for auto-scroll
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const { warnings, isLockedOut, MAX_WARNINGS } = useAntiCheat(userId);
  const timerFetchedRef = useRef(false);
  const timerRef = useRef(null);
  const resultScrollRef = useRef(null);

  // Format time as h:m:s (countdown style - shows remaining time)
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
      const res = await axios.get(`/api/users/${userId}/timer?round=1`);
      const { remaining, duration, timerStart } = res.data;
      
      setTimerDuration(duration || 1800);
      setElapsedTime(remaining);
      
      // Save to sessionStorage for persistence across refreshes
      sessionStorage.setItem('round1Remaining', remaining.toString());
      sessionStorage.setItem('round1Duration', (duration || 1800).toString());
      
      if (timerStart) {
        setStartTime(new Date(timerStart));
        sessionStorage.setItem('round1TimerStart', timerStart);
      }
      
      timerFetchedRef.current = true;
      return res.data;
    } catch (err) {
      console.error('Error fetching timer:', err);
      // Try to load from sessionStorage as fallback
      const savedRemaining = sessionStorage.getItem('round1Remaining');
      const savedDuration = sessionStorage.getItem('round1Duration');
      if (savedRemaining) {
        setElapsedTime(parseInt(savedRemaining));
        setTimerDuration(parseInt(savedDuration) || 1800);
        timerFetchedRef.current = true;
      } else {
        setElapsedTime(1800);
      }
      return null;
    }
  };

  // Check lock status on mount - always fetch from server
  const checkLockStatus = async () => {
    try {
      const res = await axios.get(`/api/users/${userId}`);
      // Server has the latest lock status - use that directly
      setIsLocked(res.data.isLockedOut || false);
      
      // Also check if user is approved
      if (!res.data.isApproved && !res.data.isLockedOut) {
        // User is not approved - redirect to instructions
        navigate('/instructions');
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
      const submittedCodeMap = userData.round1SubmittedCode || {};
      return submittedCodeMap[problemId] || null;
    } catch (err) {
      console.error('Error fetching submitted code:', err);
      return null;
    }
  };

  // Fetch problems with selected language
  const fetchProblems = async (language) => {
    try {
      const res = await axios.get(`/api/problems/round/1?language=${language}`);
      const problemsData = res.data;
      const problemsArray = Array.isArray(problemsData) ? problemsData : [problemsData];
      setProblems(problemsArray);

      if (problemsArray.length > 0) {
        setProblem(problemsArray[0]);
        // Try to load saved code first
        const savedCode = await fetchSubmittedCode(problemsArray[0]._id);
setCode(savedCode || problemsArray[0].bugCode || problemsArray[0].starterCode || '');
      }
    } catch (err) {
      console.error('Error fetching problems:', err);
      alert('Failed to load problems. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  // Initialize - fetch timer first, then problems
  useEffect(() => {
    const init = async () => {
      // Check lock status from server
      await checkLockStatus();
      
      // First, try to start timer if not started (for new users)
      try {
        await axios.post(`/api/users/${userId}/timer/start`, { round: 1, duration: 1800 });
      } catch (err) {
        // Timer might already be started, ignore error
      }
      
      // Then fetch the timer
      await fetchTimer();
      
      // Finally fetch problems
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

  // Timer effect - uses backend-controlled timer (updates every second)
  useEffect(() => {
    if (!loading && timerFetchedRef.current) {
      // Clear existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      timerRef.current = setInterval(() => {
        axios.get(`/api/users/${userId}/timer?round=1`)
          .then(res => {
            const { remaining, isExpired } = res.data;
            setElapsedTime(remaining);
            
            // Save to sessionStorage for persistence
            sessionStorage.setItem('round1Remaining', remaining.toString());
            
            if (isExpired) {
              alert('Time is up! Round 1 has ended.');
              navigate('/round-complete', {
                state: { timeTaken: timerDuration, round: 1 }
              });
            }
          })
          .catch(err => {
            console.error('Error fetching timer:', err);
          });
      }, 1000);
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [loading, userId, timerDuration, navigate]);

  // Auto-scroll to results when submissionResult changes
  useEffect(() => {
    if (submissionResult && resultScrollRef.current) {
      setTimeout(() => {
        resultScrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [submissionResult]);

  // Handle problem selection - ensure proper state update
  const handleProblemSelect = async (index) => {
    const selectedProblem = problems[index];
    if (selectedProblem) {
      setSelectedProblemIndex(index);
      setProblem(selectedProblem);
      // Try to load saved code first, then fall back to starter code
      const savedCode = await fetchSubmittedCode(selectedProblem._id);
      setCode(savedCode || selectedProblem.bugCode || selectedProblem.starterCode || '');
      setMistakes(0);
      setSubmissionResult(null);
    }
  };

  // Handle language change - keep current problem but update code for new language
  const handleLanguageChange = async (e) => {
    const newLang = e.target.value;
    const currentProblemIndex = selectedProblemIndex;
    const currentProblem = problems[currentProblemIndex];
    
    setSelectedLanguage(newLang);
    
    // Fetch problems for new language but keep current selection
    try {
      const res = await axios.get(`/api/problems/round/1?language=${newLang}`);
      const problemsData = res.data;
      const problemsArray = Array.isArray(problemsData) ? problemsData : [problemsData];
      setProblems(problemsArray);

      // Find the same problem in the new language by matching title
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

  // Allow copy/paste for user convenience
  // Disable copy/paste - prevent cheating
  const disableCopyPaste = (e) => {
    e.preventDefault();
    alert('Copy/Paste is disabled during the contest!');
  };
  
  // Auto enter fullscreen on mount
  useEffect(() => {
    const enterFullscreen = () => {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.log('Could not enter fullscreen:', err);
        });
      }
    };
    
    // Enter fullscreen after a short delay to ensure page is loaded
    const timer = setTimeout(enterFullscreen, 1000);
    
    return () => clearTimeout(timer);
  }, []);

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

  // Handle Run (test code without submission)
  const handleRun = async () => {
    setIsSubmitting(true);
    setSubmissionResult(null);
    try {
      const res = await axios.post('/api/submissions', {
        problemId: problem?._id || null,
        code,
        language: selectedLanguage,
        userId,
        round: 1,
        isRun: true // Flag for Run mode - no negative marks
      });

      const result = res.data;
      console.log('Run result:', result);
      
      // For Run, check if visible tests passed
      const isVisiblePassed = result.result?.summary?.visiblePassed === true || result.visibleTestPassed === true;
      const status = isVisiblePassed ? 'Accepted' : 'Wrong Answer';

      // Set submission result for UI display
      setSubmissionResult({
        ...result,
        status: status,
        isRun: true, // Flag to indicate this is a Run result
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

      const res = await axios.post('/api/submissions', {
        problemId: problem?._id || null,
        code,
        language: selectedLanguage,
        userId,
        round: 1,
        isRun: false // This is a real submission
      });

      const result = res.data;
      const status = result.result?.summary?.allPassed ? 'Accepted' : result.status;

      // Set submission result for UI display
      setSubmissionResult(result);

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
          // Show result then auto move to next problem after 2 seconds
          // Find next unsolved problem
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
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container">Loading problem...</div>;
  }

  // Redirect if locked out
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
            onCopy={disableCopyPaste}
            onCut={disableCopyPaste}
            onPaste={disableCopyPaste}
            draggable={false}
          />
        </div>

        {/* Loading overlay */}
        {isSubmitting && (
          <div className="submission-loading">
            <div className="loading-spinner"></div>
            <p>Processing your code...</p>
          </div>
        )}

        <div className="round-actions">
          <button onClick={handleRun} disabled={isSubmitting} className="run-btn">
            Run
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting} className="submit-btn">
            Submit
          </button>
          <button onClick={() => setCode(problem?.starterCode || '')} disabled={isSubmitting}>
            Reset Code
          </button>
        </div>

        {/* Submission Result Display */}
        {submissionResult && (
          <div className="submission-result" ref={resultScrollRef}>
            <h4>
              {submissionResult.isRun ? 'Run Result' : 'Submission Result'}
            </h4>
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
                
                {/* Only show negative marks for actual submissions, not for Run */}
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
