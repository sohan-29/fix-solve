import { useEffect, useState, useRef } from 'react';
import axios from '../api';
import { useNavigate } from 'react-router-dom';
import useAntiCheat from '../hooks/useAntiCheat';

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
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const { warnings, isLockedOut, MAX_WARNINGS } = useAntiCheat(userId);
  const timerFetchedRef = useRef(false);

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
      const res = await axios.get(`/api/users/${userId}/timer?round=2`);
      const { remaining, duration, timerStart } = res.data;
      setTimerDuration(duration || 2700);
      setElapsedTime(remaining);
      if (timerStart) {
        setStartTime(new Date(timerStart));
      }
      timerFetchedRef.current = true;
      return res.data;
    } catch (err) {
      console.error('Error fetching timer:', err);
      setElapsedTime(2700);
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
        setCode(problemsArray[0].starterCode || '');
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
      try {
        await axios.post(`/api/users/${userId}/timer/start`, { round: 2, duration: 2700 });
      } catch (err) {}
      await fetchTimer();
      await fetchProblems(selectedLanguage);
    };
    init();
  }, []);

  // Handle problem selection - ensure proper state update
  const handleProblemSelect = (index) => {
    const selectedProblem = problems[index];
    if (selectedProblem) {
      setSelectedProblemIndex(index);
      setProblem(selectedProblem);
      setCode(selectedProblem.starterCode || '');
      setMistakes(0);
    }
  };

  useEffect(() => {
    if (!loading && timerFetchedRef.current) {
      const timer = setInterval(() => {
        axios.get(`/api/users/${userId}/timer?round=2`)
          .then(res => {
            const { remaining, isExpired } = res.data;
            setElapsedTime(remaining);
            if (isExpired) {
              alert('Time is up! Round 2 has ended.');
              navigate('/round-complete', { state: { timeTaken: timerDuration, round: 2 } });
            }
          })
          .catch(err => { console.error('Error fetching timer:', err); });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [loading, userId, timerDuration, navigate]);

  // Handle language change - keep current problem but update code for new language
  const handleLanguageChange = async (e) => {
    const newLang = e.target.value;
    const currentProblemIndex = selectedProblemIndex;
    const currentProblem = problems[currentProblemIndex];
    
    setSelectedLanguage(newLang);
    
    // Fetch problems for new language but keep current selection
    try {
      const res = await axios.get(`/api/problems/round/2?language=${newLang}`);
      const problemsData = res.data;
      const problemsArray = Array.isArray(problemsData) ? problemsData : [problemsData];
      setProblems(problemsArray);

      // Find the same problem in the new language by matching title
      const sameProblem = problemsArray.find(p => p.title === currentProblem?.title);
      if (sameProblem) {
        const newIndex = problemsArray.findIndex(p => p.title === currentProblem.title);
        setSelectedProblemIndex(newIndex);
        setProblem(sameProblem);
        setCode(sameProblem.starterCode || '');
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
        userId
      });
      const result = res.data;
      const status = result.result?.summary?.allPassed ? 'Accepted' : result.status;

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
          alert('Correct! Moving to next problem...');
          const nextIndex = problems.findIndex(p => !newSolvedProblems.has(p._id));
          if (nextIndex !== -1) { handleProblemSelect(nextIndex); }
        }
      } else {
        const newMistakes = mistakes + 1;
        setMistakes(newMistakes);
        setTotalMistakes(totalMistakes + 1);
        if (result.result?.results) {
          const failedTest = result.result.results.find(r => !r.isPassed);
          if (failedTest) {
            alert(`Wrong Answer! Test Case ${failedTest.testCaseNumber}: Input: ${failedTest.input} Expected: ${failedTest.expectedOutput} Got: ${failedTest.actualOutput}`);
          } else { alert('Not correct yet, try again.'); }
        } else { alert('Not correct yet, try again.'); }
      }
    } catch (err) {
      console.error(err);
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      setTotalMistakes(totalMistakes + 1);
      alert('Submission failed');
    }
  };

  if (loading) { return <div className="container">Loading problem...</div>; }

  return (
    <div className="round-page" onContextMenu={handleCopyPaste}>
      <div className="round-header">
        <h2>Round 2 - Solve the Problem</h2>
        <div className="timer">Time: {formatTime(elapsedTime)} | Mistakes: {totalMistakes} | Solved: {solvedProblems.size}/{problems.length}</div>
        <button onClick={toggleFullscreen} className="fullscreen-btn">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</button>
      </div>
      {warnings > 0 && !isLockedOut && <div className="warning-banner">Warning! Tab switch detected.</div>}
      {isLockedOut && <div className="lockout-overlay"><div className="lockout-content"><h2>Locked Out</h2><p>Multiple tab switches detected.</p></div></div>}
      {problems.length > 1 && <div className="problem-selector"><label>Select Problem: </label><select value={selectedProblemIndex} onChange={(e) => handleProblemSelect(parseInt(e.target.value))}>{problems.map((p, i) => (<option key={p._id || i} value={i}>{solvedProblems.has(p._id) ? '✓ ' : '○ '}{p.title}</option>))}</select></div>}
      <div className="round-content-wrapper">
        {problem && <div className="problem-description"><h3>{problem.title}</h3><p>{problem.description}</p>{problem.inputFormat && <p><strong>Input Format:</strong> {problem.inputFormat}</p>}{problem.outputFormat && <p><strong>Output Format:</strong> {problem.outputFormat}</p>}{problem.constraints && <p><strong>Constraints:</strong> {problem.constraints}</p>}{problem.sampleInput && <div><strong>Sample Input:</strong><pre style={{background:'#f4f4f4',padding:'10px'}}>{problem.sampleInput}</pre></div>}{problem.sampleOutput && <div><strong>Sample Output:</strong><pre style={{background:'#f4f4f4',padding:'10px'}}>{problem.sampleOutput}</pre></div>}{problem.testCases && problem.testCases.length > 0 && <button onClick={() => setShowTestCases(!showTestCases)} style={{marginTop:'10px'}}>{showTestCases ? 'Hide' : 'Show'} Test Cases</button>}{showTestCases && problem.testCases && <div style={{marginTop:'10px'}}><h4>Test Cases:</h4>{problem.testCases.map((tc, i) => (<div key={i} style={{marginBottom:'10px',border:'1px solid #ddd',padding:'10px'}}><strong>Test Case {i+1}:</strong><br/>Input: <pre style={{display:'inline'}}>{tc.input}</pre><br/>Output: <pre style={{display:'inline'}}>{tc.output}</pre></div>))}</div>}</div>}
        <div className="language-selector"><label>Select Language: </label><select id="language" value={selectedLanguage} onChange={handleLanguageChange}>{LANGUAGES.map(lang => (<option key={lang.id} value={lang.id}>{lang.name}</option>))}</select></div>
        <div className="code-editor-wrapper"><textarea className="code-textarea" rows={15} cols={60} value={code} onChange={e => setCode(e.target.value)} onCopy={handleCopyPaste} onCut={handleCopyPaste} onPaste={handleCopyPaste} draggable={false} /></div>
        <div className="round-actions"><button onClick={handleSubmit}>Submit</button><button onClick={() => setCode(problem?.starterCode || '')}>Reset Code</button></div>
      </div>
    </div>
  );
}
