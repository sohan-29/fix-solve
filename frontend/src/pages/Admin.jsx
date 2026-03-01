import { useState, useEffect } from 'react';
import axios from '../api';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('problems');
  const [problems, setProblems] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingProblem, setEditingProblem] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    roundType: 1,
    inputFormat: '',
    outputFormat: '',
    constraints: '',
    sampleInput: '',
    sampleOutput: '',
    starterCode: '',
    bugCode: '',
    timeLimit: 60,
    difficulty: 'Easy',
    complexity: '',
    testCases: [{ input: '', output: '' }],
    hiddenTestCases: [{ input: '', output: '' }]
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'problems') {
        const res = await axios.get('/api/problems');
        setProblems(res.data);
      } else if (activeTab === 'submissions') {
        const res = await axios.get('/api/submissions');
        setSubmissions(res.data);
      } else if (activeTab === 'leaderboard') {
        const res = await axios.get('/api/users');
        setUsers(res.data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTestCaseChange = (index, field, value, isHidden = false) => {
    const key = isHidden ? 'hiddenTestCases' : 'testCases';
    const newTestCases = [...formData[key]];
    newTestCases[index] = { ...newTestCases[index], [field]: value };
    setFormData(prev => ({ ...prev, [key]: newTestCases }));
  };

  const addTestCase = (isHidden = false) => {
    const key = isHidden ? 'hiddenTestCases' : 'testCases';
    setFormData(prev => ({
      ...prev,
      [key]: [...prev[key], { input: '', output: '' }]
    }));
  };

  const removeTestCase = (index, isHidden = false) => {
    const key = isHidden ? 'hiddenTestCases' : 'testCases';
    const newTestCases = formData[key].filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [key]: newTestCases }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProblem) {
        await axios.put(`/api/problems/${editingProblem}`, formData);
      } else {
        await axios.post('/api/problems', formData);
      }
      fetchData();
      resetForm();
    } catch (err) {
      console.error('Error saving problem:', err);
      alert('Error saving problem');
    }
  };

  const handleEdit = (problem) => {
    setEditingProblem(problem._id);
    setFormData({
      title: problem.title || '',
      description: problem.description || '',
      roundType: problem.roundType || 1,
      inputFormat: problem.inputFormat || '',
      outputFormat: problem.outputFormat || '',
      constraints: problem.constraints || '',
      sampleInput: problem.sampleInput || '',
      sampleOutput: problem.sampleOutput || '',
      starterCode: problem.starterCode || '',
      bugCode: problem.bugCode || '',
      timeLimit: problem.timeLimit || 60,
      difficulty: problem.difficulty || 'Easy',
      complexity: problem.complexity || '',
      testCases: problem.testCases?.length ? problem.testCases : [{ input: '', output: '' }],
      hiddenTestCases: problem.hiddenTestCases?.length ? problem.hiddenTestCases : [{ input: '', output: '' }]
    });
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this problem?')) {
      try {
        await axios.delete(`/api/problems/${id}`);
        fetchData();
      } catch (err) {
        console.error('Error deleting problem:', err);
      }
    }
  };

  const resetForm = () => {
    setEditingProblem(null);
    setFormData({
      title: '',
      description: '',
      roundType: 1,
      inputFormat: '',
      outputFormat: '',
      constraints: '',
      sampleInput: '',
      sampleOutput: '',
      starterCode: '',
      bugCode: '',
      timeLimit: 60,
      difficulty: 'Easy',
      complexity: '',
      testCases: [{ input: '', output: '' }],
      hiddenTestCases: [{ input: '', output: '' }]
    });
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <a href="/" style={{ color: 'white', textDecoration: 'none' }}>Back to Home</a>
      </div>

      <div className="admin-tabs">
        <button 
          className={activeTab === 'problems' ? 'active' : ''}
          onClick={() => setActiveTab('problems')}
        >
          Problems
        </button>
        <button 
          className={activeTab === 'submissions' ? 'active' : ''}
          onClick={() => setActiveTab('submissions')}
        >
          Submissions
        </button>
        <button 
          className={activeTab === 'leaderboard' ? 'active' : ''}
          onClick={() => setActiveTab('leaderboard')}
        >
          Leaderboard
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'problems' && (
          <div className="problems-section">
            <div className="problem-form">
              <h2>{editingProblem ? 'Edit Problem' : 'Add New Problem'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <label>Title</label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    required
                  />
                </div>

                <div className="form-row">
                  <label>Round Type</label>
                  <select
                    name="roundType"
                    value={formData.roundType}
                    onChange={handleInputChange}
                  >
                    <option value={1}>Round 1 - Debugging</option>
                    <option value={2}>Round 2 - Coding</option>
                  </select>
                </div>

                <div className="form-row">
                  <label>Input Format</label>
                  <input
                    name="inputFormat"
                    value={formData.inputFormat}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-row">
                  <label>Output Format</label>
                  <input
                    name="outputFormat"
                    value={formData.outputFormat}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-row">
                  <label>Constraints</label>
                  <input
                    name="constraints"
                    value={formData.constraints}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-row">
                  <label>Sample Input</label>
                  <input
                    name="sampleInput"
                    value={formData.sampleInput}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-row">
                  <label>Sample Output</label>
                  <input
                    name="sampleOutput"
                    value={formData.sampleOutput}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-row">
                  <label>Time Limit (seconds)</label>
                  <input
                    name="timeLimit"
                    type="number"
                    value={formData.timeLimit}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-row">
                  <label>Difficulty</label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="form-row">
                  <label>Time Complexity</label>
                  <input
                    name="complexity"
                    value={formData.complexity}
                    onChange={handleInputChange}
                    placeholder="e.g., O(n), O(n²)"
                  />
                </div>

                {formData.roundType === 1 && (
                  <div className="form-row">
                    <label>Bug Code (for Round 1)</label>
                    <textarea
                      name="bugCode"
                      value={formData.bugCode}
                      onChange={handleInputChange}
                      rows="5"
                    />
                  </div>
                )}

                <div className="form-row">
                  <label>Starter Code</label>
                  <textarea
                    name="starterCode"
                    value={formData.starterCode}
                    onChange={handleInputChange}
                    rows="5"
                  />
                </div>

                <div className="test-cases-section">
                  <h4>Test Cases</h4>
                  {formData.testCases.map((tc, index) => (
                    <div key={index} className="test-case-row">
                      <input
                        placeholder="Input"
                        value={tc.input}
                        onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                      />
                      <input
                        placeholder="Output"
                        value={tc.output}
                        onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
                      />
                      {formData.testCases.length > 1 && (
                        <button type="button" onClick={() => removeTestCase(index)}>×</button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => addTestCase(false)}>+ Add Test Case</button>
                </div>

                <div className="test-cases-section">
                  <h4>Hidden Test Cases (not shown to users)</h4>
                  {formData.hiddenTestCases.map((tc, index) => (
                    <div key={index} className="test-case-row">
                      <input
                        placeholder="Input"
                        value={tc.input}
                        onChange={(e) => handleTestCaseChange(index, 'input', e.target.value, true)}
                      />
                      <input
                        placeholder="Output"
                        value={tc.output}
                        onChange={(e) => handleTestCaseChange(index, 'output', e.target.value, true)}
                      />
                      {formData.hiddenTestCases.length > 1 && (
                        <button type="button" onClick={() => removeTestCase(index, true)}>×</button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => addTestCase(true)}>+ Add Hidden Test Case</button>
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-btn">
                    {editingProblem ? 'Update Problem' : 'Save Problem'}
                  </button>
                  {editingProblem && (
                    <button type="button" className="cancel-btn" onClick={resetForm}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="problems-list">
              <h2>Existing Problems</h2>
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Round</th>
                    <th>Difficulty</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {problems.map(problem => (
                    <tr key={problem._id}>
                      <td>{problem.title}</td>
                      <td>{problem.roundType === 1 ? 'Debugging' : 'Coding'}</td>
                      <td>{problem.difficulty}</td>
                      <td>
                        <button onClick={() => handleEdit(problem)}>Edit</button>
                        <button className="delete-btn" onClick={() => handleDelete(problem._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="submissions-section">
            <h2>All Submissions</h2>
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Problem</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(sub => (
                  <tr key={sub._id}>
                    <td>{sub.user?.name || 'Unknown'}</td>
                    <td>{sub.problem?.title || 'Unknown'}</td>
                    <td>{sub.status}</td>
                    <td>{new Date(sub.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="leaderboard-section">
            <h2>Leaderboard</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Round 1 Time</th>
                  <th>Round 2 Time</th>
                  <th>Total Time</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .sort((a, b) => (a.totalTime || 0) - (b.totalTime || 0))
                  .map(user => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.round1Time ? `${user.round1Time.toFixed(2)}s` : '-'}</td>
                      <td>{user.round2Time ? `${user.round2Time.toFixed(2)}s` : '-'}</td>
                      <td>{user.totalTime ? `${user.totalTime.toFixed(2)}s` : '-'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
