import { useState, useEffect } from 'react';
import axios from '../api';

const ADMIN_PASSWORD = 'admin123';

// Language options
const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'c', name: 'C' },
  { id: 'cpp', name: 'C++' },
  { id: 'java', name: 'Java' },
  { id: 'python', name: 'Python' }
];

// Default boilerplate code templates for Round 1 (Debugging)
const DEFAULT_BUG_CODE = {
  javascript: `// Fix the bug in this function
function add(a, b) {
  // should return sum
  return a - b;
}

// Main function - DO NOT MODIFY
const readline = require('readline');
const rl = readline.createInterface({input: process.stdin, output: process.stdout});
rl.on('line', (line) => {
  const [a, b] = line.split(' ').map(Number);
  console.log(add(a, b));
  rl.close();
});`,
  c: `// Fix the bug in this function
#include <stdio.h>

int add(int a, int b) {
  // should return sum
  return a - b;
}

// Main function - DO NOT MODIFY
int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d", add(a, b));
    return 0;
}`,
  cpp: `// Fix the bug in this function
#include <iostream>
using namespace std;

int add(int a, int b) {
  // should return sum
  return a - b;
}

// Main function - DO NOT MODIFY
int main() {
    int a, b;
    cin >> a >> b;
    cout << add(a, b);
    return 0;
}`,
  java: `// Fix the bug in this function
import java.util.Scanner;

public class Solution {
    public static int add(int a, int b) {
        // should return sum
        return a - b;
    }
    
    // Main function - DO NOT MODIFY
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(add(a, b));
    }
}`,
  python: `# Fix the bug in this function
def add(a, b):
    # should return sum
    return a - b

# Main function - DO NOT MODIFY
if __name__ == "__main__":
    a, b = map(int, input().split())
    print(add(a, b))`
};

// Default boilerplate code templates for Round 2 (Coding) - User writes code directly in main
const DEFAULT_STARTER_CODE = {
  javascript: `// Write your code in main

const readline = require('readline');
const rl = readline.createInterface({input: process.stdin, output: process.stdout});

rl.on('line', (line) => {
  // Write your code here
  // Process the input and print the result
  
  console.log(result);
  rl.close();
});`,
  c: `// Write your code in main

#include <stdio.h>

int main() {
  // Write your code here
  // Read input using scanf and print the result
  
  return 0;
}`,
  cpp: `// Write your code in main

#include <iostream>
using namespace std;

int main() {
  // Write your code here
  // Read input using cin and print the result
  
  return 0;
}`,
  java: `
  import java.util.Scanner;

public class Solution {
  public static void main(String[] args) {
    // Write your code here
    // Read input using Scanner and print the result
    
  }
}`,
python: `# Read input using input() and print the result
# Write your code here`
};

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('problems');
  const [saveError, setSaveError] = useState('');
  const [problems, setProblems] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingProblem, setEditingProblem] = useState(null);
  
  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, type: '', id: '', name: '' });
  const [deleteInput, setDeleteInput] = useState('');
  
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
    marks: 10,
    complexityExpected: 'O(n)',
    starterCodeByLanguage: {
      javascript: '',
      c: '',
      cpp: '',
      java: '',
      python: ''
    },
    bugCodeByLanguage: {
      javascript: '',
      c: '',
      cpp: '',
      java: '',
      python: ''
    },
    supportedLanguages: ['c'],
    timeLimit: 60,
    difficulty: 'Easy',
    complexity: '',
    testCases: [{ input: '', output: '' }],
    hiddenTestCases: [{ input: '', output: '' }]
  });

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [activeTab, isAuthenticated]);

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

  const handleLanguageCodeChange = (e, lang, codeType) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      [codeType]: {
        ...prev[codeType],
        [lang]: value
      }
    }));
  };

  const handleSupportedLanguagesChange = (e, lang) => {
    const { checked } = e.target;
    setFormData(prev => {
      let newLangs;
      if (checked) {
        newLangs = [...prev.supportedLanguages, lang];
      } else {
        newLangs = prev.supportedLanguages.filter(l => l !== lang);
      }
      return { ...prev, supportedLanguages: newLangs };
    });
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

  // Generate boilerplate code for all languages
  const generateBoilerplate = () => {
    if (formData.roundType === 1) {
      // For Round 1 (Debugging) - use bug code templates
      const pythonBugCode = `# Fix the bug in this function
def add(a, b):
    # should return sum
    return a - b

# Main function - DO NOT MODIFY
if __name__ == "__main__":
    a, b = map(int, input().split())
    print(add(a, b))`;
      
      setFormData(prev => ({
        ...prev,
        bugCode: DEFAULT_BUG_CODE.c,
        bugCodeByLanguage: {
          ...DEFAULT_BUG_CODE,
          python: pythonBugCode
        },
        starterCode: DEFAULT_STARTER_CODE.c,
        starterCodeByLanguage: { ...DEFAULT_STARTER_CODE }
      }));
    } else {
      // For Round 2 (Coding) - use starter code templates
      const pythonStarterCode = `# Write your code here
# Read input using input() and print output
def solve():
    # Your code here
    pass

if __name__ == "__main__":
    solve()`;
      
      setFormData(prev => ({
        ...prev,
        starterCode: DEFAULT_STARTER_CODE.c,
        starterCodeByLanguage: {
          ...DEFAULT_STARTER_CODE,
          python: pythonStarterCode
        },
        bugCode: '',
        bugCodeByLanguage: {
          javascript: '', c: '', cpp: '', java: '', python: ''
        }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError('');
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
      
      let errorMessage;
      
      // Check for network error (no response from server, CORS issues, etc.)
      if (!err.response) {
        // Network error - could be server down, CORS issue, etc.
        if (err.message && err.message.includes('Network Error')) {
          errorMessage = 'Network Error: Unable to connect to the server. Please ensure the backend is running and CORS is properly configured.';
        } else if (err.code === 'ECONNREFUSED') {
          errorMessage = 'Connection Refused: The server is not running. Please start the backend server.';
        } else if (err.code === 'ERR_NETWORK') {
          errorMessage = 'Network Error: Unable to connect to the server. Please check if the backend is running.';
        } else {
          errorMessage = err.message || 'Network Error: Unable to connect to server';
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data) {
        errorMessage = JSON.stringify(err.response.data);
      } else {
        errorMessage = err.message || 'Error saving problem';
      }
      
      setSaveError(errorMessage);
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
      marks: problem.marks || 10,
      complexityExpected: problem.complexityExpected || 'O(n)',
      starterCodeByLanguage: problem.starterCodeByLanguage || {
        javascript: '', c: '', cpp: '', java: '', python: ''
      },
      bugCodeByLanguage: problem.bugCodeByLanguage || {
        javascript: '', c: '', cpp: '', java: '', python: ''
      },
      supportedLanguages: problem.supportedLanguages || ['c'],
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

  // Delete submission functions
  const initiateDeleteSubmission = (id, name) => {
    setDeleteConfirm({ show: true, type: 'submission', id, name });
    setDeleteInput('');
  };

  const initiateDeleteUser = (id, name) => {
    setDeleteConfirm({ show: true, type: 'user', id, name });
    setDeleteInput('');
  };

  const confirmDelete = async () => {
    if (deleteInput !== deleteConfirm.name) {
      alert('Name/ID does not match. Please enter the correct name to confirm deletion.');
      return;
    }

    try {
      if (deleteConfirm.type === 'submission') {
        await axios.delete(`/api/submissions/${deleteConfirm.id}`);
      } else if (deleteConfirm.type === 'user') {
        await axios.delete(`/api/users/${deleteConfirm.id}`);
      }
      setDeleteConfirm({ show: false, type: '', id: '', name: '' });
      fetchData();
      alert('Deleted successfully!');
    } catch (err) {
      console.error('Error deleting:', err);
      alert('Error deleting. The record may have already been removed.');
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, type: '', id: '', name: '' });
    setDeleteInput('');
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
      marks: 10,
      complexityExpected: 'O(n)',
      starterCodeByLanguage: {
        javascript: '', c: '', cpp: '', java: '', python: ''
      },
      bugCodeByLanguage: {
        javascript: '', c: '', cpp: '', java: '', python: ''
      },
      supportedLanguages: ['c'],
      timeLimit: 60,
      difficulty: 'Easy',
      complexity: '',
      testCases: [{ input: '', output: '' }],
      hiddenTestCases: [{ input: '', output: '' }]
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="login-box">
          <h1>Admin Login</h1>
          <form onSubmit={handleLogin}>
            <div className="form-row">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
              />
            </div>
            {error && <p className="login-error">{error}</p>}
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="modal-overlay">
          <div className="delete-confirm-modal">
            <h3>Confirm Deletion</h3>
            <p>You are about to delete a {deleteConfirm.type}.</p>
            <p>Please enter <strong>"{deleteConfirm.name}"</strong> to confirm:</p>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="Enter name to confirm"
            />
            <div className="modal-actions">
              <button onClick={confirmDelete} className="confirm-delete-btn">Delete</button>
              <button onClick={cancelDelete} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

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

                {/* Marks Field */}
                <div className="form-row">
                  <label>Marks (Total for this question)</label>
                  <input
                    name="marks"
                    type="number"
                    value={formData.marks}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="e.g., 10"
                  />
                  <small style={{color: '#666', marginLeft: '10px'}}>
                    Visible tests: 40% | Hidden tests: 60%
                  </small>
                </div>

                {/* Expected Complexity Field */}
                <div className="form-row">
                  <label>Expected Time Complexity</label>
                  <input
                    name="complexityExpected"
                    value={formData.complexityExpected}
                    onChange={handleInputChange}
                    placeholder="e.g., O(n), O(n²)"
                  />
                  <small style={{color: '#666', marginLeft: '10px'}}>
                    For optimal code bonus (+1 mark)
                  </small>
                </div>

                {/* Supported Languages */}
                <div className="form-row">
                  <label>Supported Languages</label>
                  <div className="language-checkboxes">
                    {LANGUAGES.map(lang => (
                      <label key={lang.id} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.supportedLanguages.includes(lang.id)}
                          onChange={(e) => handleSupportedLanguagesChange(e, lang.id)}
                        />
                        {lang.name}
                      </label>
                    ))}
                  </div>
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

                {/* Boilerplate Code Generator Button */}
                <div className="form-row">
                  <button 
                    type="button" 
                    onClick={generateBoilerplate}
                    style={{ background: '#1a1a1a', color: '#00ff00', border: '1px solid #00ff00', padding: '10px', cursor: 'pointer', marginBottom: '15px' }}
                  >
                    {formData.roundType === 1 ? 'Generate Bug Code Templates' : 'Generate Starter Code Templates'}
                  </button>
                </div>

                {/* Language-specific Bug Code for Round 1 */}
                {formData.roundType === 1 && (
                  <>
                    <div className="form-row">
                      <label>Bug Code (Default - C)</label>
                      <textarea
                        name="bugCode"
                        value={formData.bugCode}
                        onChange={handleInputChange}
                        rows="5"
                        placeholder="Default bug code"
                      />
                    </div>
                    
                    <div className="language-codes-section">
                      <h4>Bug Code by Language</h4>
                      {LANGUAGES.map(lang => (
                        <div key={lang.id} className="form-row">
                          <label>{lang.name} Bug Code</label>
                          <textarea
                            value={formData.bugCodeByLanguage[lang.id] || ''}
                            onChange={(e) => handleLanguageCodeChange(e, lang.id, 'bugCodeByLanguage')}
                            rows="4"
                            placeholder={`Bug code for ${lang.name}`}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Language-specific Starter Code */}
                <div className="form-row">
                  <label>Starter Code (Default - C)</label>
                  <textarea
                    name="starterCode"
                    value={formData.starterCode}
                    onChange={handleInputChange}
                    rows="5"
                    placeholder="Default starter code"
                  />
                </div>

                <div className="language-codes-section">
                  <h4>Starter Code by Language</h4>
                  {LANGUAGES.map(lang => (
                    <div key={lang.id} className="form-row">
                      <label>{lang.name} Starter Code</label>
                      <textarea
                        value={formData.starterCodeByLanguage[lang.id] || ''}
                        onChange={(e) => handleLanguageCodeChange(e, lang.id, 'starterCodeByLanguage')}
                        rows="4"
                        placeholder={`Starter code for ${lang.name}`}
                      />
                    </div>
                  ))}
                </div>

                <div className="test-cases-section">
                  <h4>Test Cases (Visible - 40% marks)</h4>
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
                  <h4>Hidden Test Cases (60% marks - not shown to users)</h4>
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

                {saveError && (
                  <div className="error-message" style={{ color: 'red', marginTop: '10px', padding: '10px', border: '1px solid red', borderRadius: '4px', backgroundColor: '#ffe6e6' }}>
                    <strong>Error:</strong> {saveError}
                  </div>
                )}

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
                    <th>Marks</th>
                    <th>Languages</th>
                    <th>Difficulty</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {problems.map(problem => (
                    <tr key={problem._id}>
                      <td>{problem.title}</td>
                      <td>{problem.roundType === 1 ? 'Debugging' : 'Coding'}</td>
                      <td>{problem.marks || 10}</td>
                      <td>{problem.supportedLanguages?.join(', ') || 'C'}</td>
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
                  <th>Language</th>
                  <th>Status</th>
                  <th>Marks</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(sub => (
                  <tr key={sub._id}>
                    <td>{sub.user?.name || 'Unknown'}</td>
                    <td>{sub.problem?.title || 'Unknown'}</td>
                    <td>{sub.language || 'N/A'}</td>
                    <td>{sub.status}</td>
                    <td>{sub.marks || 0}</td>
                    <td>{new Date(sub.createdAt).toLocaleString()}</td>
                    <td>
                      <button 
                        className="delete-btn"
                        onClick={() => initiateDeleteSubmission(sub._id, sub.user?.name || 'Unknown')}
                        title="Delete Submission"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="leaderboard-section">
            <h2>Leaderboard (Sorted: Marks → Time → Optimal)</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Marks</th>
                  <th>Round 1</th>
                  <th>Round 2</th>
                  <th>Time</th>
                  <th>Optimal</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .sort((a, b) => {
                    // Primary: Marks (higher is better)
                    if ((b.totalScore || 0) !== (a.totalScore || 0)) {
                      return (b.totalScore || 0) - (a.totalScore || 0);
                    }
                    // Secondary: Time (lower is better)
                    if ((a.totalTime || 0) !== (b.totalTime || 0)) {
                      return (a.totalTime || 0) - (b.totalTime || 0);
                    }
                    // Tertiary: Optimal points (higher is better)
                    return (b.totalOptimalPoints || 0) - (a.totalOptimalPoints || 0);
                  })
                  .map((user, index) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td><strong>{user.totalScore?.toFixed(2) || '0.00'}</strong></td>
                      <td>{user.round1Score?.toFixed(2) || '0.00'}</td>
                      <td>{user.round2Score?.toFixed(2) || '0.00'}</td>
                      <td>{user.totalTime ? `${user.totalTime.toFixed(2)}s` : '-'}</td>
                      <td>{user.totalOptimalPoints || 0}</td>
                      <td>
                        <button 
                          className="delete-btn"
                          onClick={() => initiateDeleteUser(user._id, user.name)}
                          title="Delete User"
                        >
                          🗑️
                        </button>
                      </td>
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
