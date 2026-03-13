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
  const [timerDuration, setTimerDuration] = useState(1800);
  const [isLocked, setIsLocked] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const { warnings, isLockedOut, MAX_WARNINGS } = useAntiCheat(userId);
  const timerFetchedRef = useRef(false);
  const timerRef = useRef(null);
  const resultScrollRef = useRef(null);
  const editorRef = useRef(null);

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
      const res = await axios.get(`/users/${userId}/timer?round=1`);
      const { remaining, duration, timerStart } = res.data;
      setTimerDuration(duration || 1800);
      setElapsedTime(remaining);
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
      const submittedCodeMap = userData.round1SubmittedCode || {};
      return submittedCodeMap[problemId] || null;
    } catch (err) {
      console.error('Error fetching submitted code:', err);
      return null;
    }
  };

  const fetchProblems = async (language) => {
    try {
      const res = await axios.get(`/problems/round/1?language=${language}`);
      const problemsData = res.data;
      const problemsArray = Array.isArray(problemsData) ? problemsData : [problemsData];
      setProblems(problemsArray);
      if (problemsArray.length > 0) {
        setProblem(problemsArray[0]);
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
          await axios.post(`/users/${userId}/timer/start`, { round: 1, duration: 1800 });
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
        axios.get(`/users/${userId}/timer?round=1`)
          .then(res => {
            const { remaining, isExpired } = res.data;
            setElapsedTime(remaining);
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

  // Auto-scroll to results when they appear
  useEffect(() => {
    if (submissionResult && resultScrollRef.current) {
      // First, show a visible notification
      const resultsSection = document.getElementById('results-section');
      if (resultsSection) {
        resultsSection.classList.add('results-visible');
      }

      // Then scroll to results
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
      setCode(savedCode || selectedProblem.bugCode || selectedProblem.starterCode || '');
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
      const res = await axios.get(`/problems/round/1?language=${newLang}`);
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
    alert('Copy/Paste/Cut is strictly disabled during the contest!');
  };

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;

    // Disable paste via Monaco's built-in actions
    // Override the clipboard paste action with a no-op
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {
      alert('Pasting is disabled during the contest!');
    });
    // Also block Shift+Insert paste
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Insert, () => {
      alert('Pasting is disabled during the contest!');
    });

    // Intercept the paste event on the editor's textarea
    const editorDomNode = editor.getDomNode();
    if (editorDomNode) {
      editorDomNode.addEventListener('paste', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    }
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
        round: 1,
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
        round: 1,
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
          const elapsed = (Date.now() - startTime) / 1000;
          const penalty = totalMistakes * 5;
          const total = elapsed + penalty;
          await axios.post('/contests/end', { name: userName, round: 1, timeTaken: total });
          navigate('/round-complete', {
            state: {
              timeTaken: elapsed,
              mistakes: totalMistakes,
              penalty,
              round: 1
            }
          });
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

  if (loading) {
    return <div className="container">Loading problem...</div>;
  }

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
    <div className="round-page" 
      onContextMenu={disableCopyPaste}
      onCopy={disableCopyPaste}
      onCut={disableCopyPaste}
      onPaste={disableCopyPaste}
    >
      <div className="round-header">
        <h2>Round 1 - Debug the Code</h2>
        <div className="timer">
          Time: {formatTime(elapsedTime)} | Mistakes: {totalMistakes} | Solved: {solvedProblems.size}/{problems.length}
        </div>
        <button onClick={toggleFullscreen} className="fullscreen-btn">
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
      </div>

      {warnings > 0 && !isLockedOut && (
        <div className="warning-banner">
          ⚠️ Warning! Tab switch detected. If you switch again you will be <strong>locked out</strong>.
        </div>
      )}

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

        <div className="code-editor-wrapper" style={{ height: '500px', border: '1px solid #333' }}>
          <Editor
            height="100%"
            language={selectedLanguage === 'c' ? 'cpp' : selectedLanguage}
            value={code}
            onChange={(value) => setCode(value || '')}
            onMount={handleEditorMount}
            theme="vs-dark"
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
