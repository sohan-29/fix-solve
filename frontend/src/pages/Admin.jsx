import { useState, useEffect } from 'react';
import axios from '../api';

const ADMIN_PASSWORD = 'admin123';

const LANGUAGES = [
  { id: 'c', name: 'C' },
  { id: 'cpp', name: 'C++' },
  { id: 'java', name: 'Java' },
  { id: 'python', name: 'Python' }
];

const DEFAULT_BUG_CODE = {
  javascript: `// Fix the bug
function add(a, b) { return a - b; }
const rl = require('readline').createInterface({input: process.stdin, output: process.stdout});
rl.on('line', (line) => { const [a, b] = line.split(' ').map(Number); console.log(add(a, b)); rl.close(); });`,
  c: `#include <stdio.h>
int add(int a, int b) { return a - b; }
int main() { int a, b; scanf("%d %d", &a, &b); printf("%d", add(a, b)); return 0; }`,
  cpp: `#include <iostream>
using namespace std;
int add(int a, int b) { return a - b; }
int main() { int a, b; cin >> a >> b; cout << add(a, b); return 0; }`,
  java: `import java.util.Scanner;
public class Solution { public static int add(int a, int b) { return a - b; }
public static void main(String[] args) { Scanner sc = new Scanner(System.in); int a = sc.nextInt(), b = sc.nextInt(); System.out.println(add(a, b)); } }`,
  python: `def add(a, b): return a - b
if __name__ == "__main__": a, b = map(int, input().split()); print(add(a, b))`
};

const DEFAULT_STARTER_CODE = {
  javascript: `const rl = require('readline').createInterface({input: process.stdin, output: process.stdout});
rl.on('line', (line) => { console.log(result); rl.close(); });`,
  c: `#include <stdio.h>
int main() { return 0; }`,
  cpp: `#include <iostream>
using namespace std;
int main() { return 0; }`,
  java: `import java.util.Scanner;
public class Solution { public static void main(String[] args) { } }`,
  python: `# Write your code here`
};

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('approvals');
  const [saveError, setSaveError] = useState('');
  const [problems, setProblems] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [editingProblem, setEditingProblem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, type: '', id: '', name: '' });
  const [deleteInput, setDeleteInput] = useState('');
  const [selectedGenerateLang, setSelectedGenerateLang] = useState('c');
  const [formData, setFormData] = useState({
    title: '', description: '', roundType: 1, inputFormat: '', outputFormat: '', constraints: '',
    sampleInput: '', sampleOutput: '', starterCode: '', bugCode: '', marks: 10, complexityExpected: 'O(n)',
    starterCodeByLanguage: { javascript: '', c: '', cpp: '', java: '', python: '' },
    bugCodeByLanguage: { javascript: '', c: '', cpp: '', java: '', python: '' },
    supportedLanguages: ['c'], timeLimit: 60, difficulty: 'Easy', complexity: '',
    testCases: [{ input: '', output: '' }], hiddenTestCases: [{ input: '', output: '' }]
  });

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) { setIsAuthenticated(true); setError(''); }
    else { setError('Invalid password'); }
  };

  useEffect(() => { if (isAuthenticated) fetchData(); }, [activeTab, isAuthenticated]);

  const fetchData = async () => {
    try {
      if (activeTab === 'problems') { const res = await axios.get('/api/problems'); setProblems(res.data); }
      else if (activeTab === 'submissions') { const res = await axios.get('/api/submissions'); setSubmissions(res.data); }
      else if (activeTab === 'leaderboard' || activeTab === 'approvals') {
        const res = await axios.get('/api/users'); setUsers(res.data);
        const approvalsRes = await axios.get('/api/users/pending-approvals'); setPendingApprovals(approvalsRes.data);
      }
    } catch (err) { console.error('Error fetching data:', err); }
  };

  const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
  const handleLanguageCodeChange = (e, lang, codeType) => { const { value } = e.target; setFormData(prev => ({ ...prev, [codeType]: { ...prev[codeType], [lang]: value } })); };
  const handleSupportedLanguagesChange = (e, lang) => { const { checked } = e.target; setFormData(prev => ({ ...prev, supportedLanguages: checked ? [...prev.supportedLanguages, lang] : prev.supportedLanguages.filter(l => l !== lang) })); };
  const handleTestCaseChange = (index, field, value, isHidden = false) => { const key = isHidden ? 'hiddenTestCases' : 'testCases'; const newTestCases = [...formData[key]]; newTestCases[index] = { ...newTestCases[index], [field]: value }; setFormData(prev => ({ ...prev, [key]: newTestCases })); };
  const addTestCase = (isHidden = false) => { const key = isHidden ? 'hiddenTestCases' : 'testCases'; setFormData(prev => ({ ...prev, [key]: [...prev[key], { input: '', output: '' }] })); };
  const removeTestCase = (index, isHidden = false) => { const key = isHidden ? 'hiddenTestCases' : 'testCases'; setFormData(prev => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) })); };

  const generateBoilerplate = () => {
    const langCode = DEFAULT_BUG_CODE[selectedGenerateLang] || DEFAULT_BUG_CODE.c;
    const starterCode = DEFAULT_STARTER_CODE[selectedGenerateLang] || DEFAULT_STARTER_CODE.c;
    
    if (formData.roundType === 1) {
      setFormData(prev => ({ 
        ...prev, 
        bugCode: langCode, 
        bugCodeByLanguage: { ...DEFAULT_BUG_CODE }, 
        starterCode: starterCode, 
        starterCodeByLanguage: { ...DEFAULT_STARTER_CODE } 
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        starterCode: starterCode, 
        starterCodeByLanguage: { ...DEFAULT_STARTER_CODE }, 
        bugCode: '', 
        bugCodeByLanguage: { javascript: '', c: '', cpp: '', java: '', python: '' } 
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaveError('');
    try {
      if (editingProblem) { await axios.put(`/api/problems/${editingProblem}`, formData); }
      else { await axios.post('/api/problems', formData); }
      fetchData(); resetForm();
    } catch (err) { console.error('Error saving problem:', err); setSaveError(err.message || 'Error saving problem'); }
  };

  const handleEdit = (problem) => {
    setEditingProblem(problem._id);
    setFormData({ title: problem.title || '', description: problem.description || '', roundType: problem.roundType || 1, inputFormat: problem.inputFormat || '', outputFormat: problem.outputFormat || '', constraints: problem.constraints || '', sampleInput: problem.sampleInput || '', sampleOutput: problem.sampleOutput || '', starterCode: problem.starterCode || '', bugCode: problem.bugCode || '', marks: problem.marks || 10, complexityExpected: problem.complexityExpected || 'O(n)', starterCodeByLanguage: problem.starterCodeByLanguage || { javascript: '', c: '', cpp: '', java: '', python: '' }, bugCodeByLanguage: problem.bugCodeByLanguage || { javascript: '', c: '', cpp: '', java: '', python: '' }, supportedLanguages: problem.supportedLanguages || ['c'], timeLimit: problem.timeLimit || 60, difficulty: problem.difficulty || 'Easy', complexity: problem.complexity || '', testCases: problem.testCases?.length ? problem.testCases : [{ input: '', output: '' }], hiddenTestCases: problem.hiddenTestCases?.length ? problem.hiddenTestCases : [{ input: '', output: '' }] });
  };

  const handleDelete = async (id) => { if (confirm('Delete this problem?')) { try { await axios.delete(`/api/problems/${id}`); fetchData(); } catch (err) { console.error('Error deleting:', err); } } };

  const approveUser = async (userId) => { try { await axios.post(`/api/users/${userId}/approve`); fetchData(); alert('Approved!'); } catch (err) { console.error(err); } };
  const unapproveUser = async (userId) => { try { await axios.post(`/api/users/${userId}/unapprove`); fetchData(); } catch (err) { console.error(err); } };
  const unlockUser = async (userId) => { try { await axios.post('/api/contests/unlock-user', { userId }); fetchData(); alert('User unlocked!'); } catch (err) { console.error(err); } };
  const initiateDeleteUser = (id, name) => { setDeleteConfirm({ show: true, type: 'user', id, name }); setDeleteInput(''); };
  const confirmDelete = async () => { if (deleteInput !== deleteConfirm.name) { alert('Name mismatch'); return; } try { if (deleteConfirm.type === 'submission') await axios.delete(`/api/submissions/${deleteConfirm.id}`); else if (deleteConfirm.type === 'user') await axios.delete(`/api/users/${deleteConfirm.id}`); setDeleteConfirm({ show: false, type: '', id: '', name: '' }); fetchData(); } catch (err) { console.error(err); } };
  const cancelDelete = () => { setDeleteConfirm({ show: false, type: '', id: '', name: '' }); setDeleteInput(''); };
  const resetForm = () => { setEditingProblem(null); setFormData({ title: '', description: '', roundType: 1, inputFormat: '', outputFormat: '', constraints: '', sampleInput: '', sampleOutput: '', starterCode: '', bugCode: '', marks: 10, complexityExpected: 'O(n)', starterCodeByLanguage: { javascript: '', c: '', cpp: '', java: '', python: '' }, bugCodeByLanguage: { javascript: '', c: '', cpp: '', java: '', python: '' }, supportedLanguages: ['c'], timeLimit: 60, difficulty: 'Easy', complexity: '', testCases: [{ input: '', output: '' }], hiddenTestCases: [{ input: '', output: '' }] }); };

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="login-box">
          <h1>Admin Login</h1>
          <form onSubmit={handleLogin}>
            <div className="form-row"><label>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter admin password" /></div>
            {error && <p className="login-error">{error}</p>}
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {deleteConfirm.show && <div className="modal-overlay"><div className="delete-confirm-modal"><h3>Confirm</h3><p>Enter "{deleteConfirm.name}" to confirm:</p><input value={deleteInput} onChange={e => setDeleteInput(e.target.value)} placeholder="Enter name" /><div className="modal-actions"><button onClick={confirmDelete} className="confirm-delete-btn">Delete</button><button onClick={cancelDelete} className="cancel-btn">Cancel</button></div></div></div>}
      <div className="admin-header"><h1>Admin Panel</h1><a href="/">Back to Home</a></div>
      <div className="admin-tabs">
        <button className={activeTab === 'approvals' ? 'active' : ''} onClick={() => setActiveTab('approvals')}>Approvals {pendingApprovals.length > 0 && <span className="badge">{pendingApprovals.length}</span>}</button>
        <button className={activeTab === 'problems' ? 'active' : ''} onClick={() => setActiveTab('problems')}>Problems</button>
        <button className={activeTab === 'submissions' ? 'active' : ''} onClick={() => setActiveTab('submissions')}>Submissions</button>
        <button className={activeTab === 'leaderboard' ? 'active' : ''} onClick={() => setActiveTab('leaderboard')}>Leaderboard</button>
      </div>
      <div className="admin-content">
        {activeTab === 'approvals' && (
          <div className="approvals-section">
            <h2>User Approvals</h2>
            <div className="pending-approvals"><h3>Pending Requests</h3>
              {pendingApprovals.length === 0 ? <p className="no-data">No pending requests</p> : (
                <table><thead><tr><th>Name</th><th>Requested</th><th>Action</th></tr></thead><tbody>{pendingApprovals.map(u => <tr key={u._id}><td>{u.name}</td><td>{u.approvalRequestedAt ? new Date(u.approvalRequestedAt).toLocaleString() : '-'}</td><td><button onClick={() => approveUser(u._id)} className="approve-btn">Approve</button></td></tr>)}</tbody></table>
              )}
            </div>
            <div className="all-users"><h3>All Users</h3>
              <table><thead><tr><th>Name</th><th>Approved</th><th>Locked</th><th>R1</th><th>R2</th><th>Score</th><th>Actions</th></tr></thead><tbody>
              {users.map(u => <tr key={u._id}><td>{u.name}</td><td>{u.isApproved ? <span className="status-approved-text">Yes</span> : <span className="status-rejected-text">No</span>}</td><td>{u.isLockedOut ? <span className="status-locked-text">Locked</span> : <span className="status-active-text">Active</span>}</td><td>{u.round1Score?.toFixed(2) || '0.00'}</td><td>{u.round2Score?.toFixed(2) || '0.00'}</td><td><strong>{u.totalScore?.toFixed(2) || '0.00'}</strong></td><td>{!u.isApproved && <button onClick={() => approveUser(u._id)} className="approve-btn">Approve</button>}{u.isApproved && <button onClick={() => unapproveUser(u._id)} className="unapprove-btn">Unapprove</button>}{u.isLockedOut && <button onClick={() => unlockUser(u._id)} className="unlock-btn">Unlock</button>}<button onClick={() => initiateDeleteUser(u._id, u.name)} className="delete-btn">🗑</button></td></tr>)}
              </tbody></table>
            </div>
          </div>
        )}
        {activeTab === 'problems' && (
          <div className="problems-section">
            <div className="problem-form">
              <h2>{editingProblem ? 'Edit Problem' : 'Add Problem'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-row"><label>Title</label><input name="title" value={formData.title} onChange={handleInputChange} required /></div>
                <div className="form-row"><label>Description</label><textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" required /></div>
                <div className="form-row"><label>Round</label><select name="roundType" value={formData.roundType} onChange={handleInputChange}><option value={1}>Round 1</option><option value={2}>Round 2</option></select></div>
                <div className="form-row"><label>Marks</label><input name="marks" type="number" value={formData.marks} onChange={handleInputChange} /></div>
                <div className="form-row"><label>Languages</label><div className="language-checkboxes">{LANGUAGES.map(l => <label key={l.id}><input type="checkbox" checked={formData.supportedLanguages.includes(l.id)} onChange={e => handleSupportedLanguagesChange(e, l.id)} />{l.name}</label>)}</div></div>
                <div className="form-row"><label>Input Format</label><input name="inputFormat" value={formData.inputFormat} onChange={handleInputChange} /></div>
                <div className="form-row"><label>Output Format</label><input name="outputFormat" value={formData.outputFormat} onChange={handleInputChange} /></div>
                <div className="form-row"><label>Sample Input</label><input name="sampleInput" value={formData.sampleInput} onChange={handleInputChange} /></div>
                <div className="form-row"><label>Sample Output</label><input name="sampleOutput" value={formData.sampleOutput} onChange={handleInputChange} /></div>
                
                {/* Generate Code with language selection */}
                <div className="form-row generate-code-row">
                  <label>Generate Code Template:</label>
                  <select value={selectedGenerateLang} onChange={e => setSelectedGenerateLang(e.target.value)}>
                    {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                  <button type="button" onClick={generateBoilerplate}>Generate</button>
                </div>
                
                {/* Language-specific code sections */}
                <div className="language-codes-section">
                  <h4>Code by Language (Optional - overrides default)</h4>
                  {LANGUAGES.map(lang => (
                    <div key={lang.id} className="language-code-entry">
                      <label>{lang.name} Starter Code:</label>
                      <textarea 
                        value={formData.starterCodeByLanguage?.[lang.id] || ''} 
                        onChange={(e) => handleLanguageCodeChange(e, lang.id, 'starterCodeByLanguage')}
                        rows="4"
                        placeholder={`Enter ${lang.name} starter code...`}
                      />
                      {formData.roundType === 1 && (
                        <>
                          <label>{lang.name} Bug Code:</label>
                          <textarea 
                            value={formData.bugCodeByLanguage?.[lang.id] || ''} 
                            onChange={(e) => handleLanguageCodeChange(e, lang.id, 'bugCodeByLanguage')}
                            rows="4"
                            placeholder={`Enter ${lang.name} bug code...`}
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
                
                {formData.roundType === 1 && <div className="form-row"><label>Bug Code (Default - used if language not specified)</label><textarea name="bugCode" value={formData.bugCode} onChange={handleInputChange} rows="5" /></div>}
                <div className="form-row"><label>Starter Code (Default - used if language not specified)</label><textarea name="starterCode" value={formData.starterCode} onChange={handleInputChange} rows="5" /></div>
                
                <div className="test-cases-section"><h4>Test Cases</h4>{formData.testCases.map((tc, i) => <div key={i} className="test-case-row"><input placeholder="Input" value={tc.input} onChange={e => handleTestCaseChange(i, 'input', e.target.value)} /><input placeholder="Expected Output" value={tc.output} onChange={e => handleTestCaseChange(i, 'output', e.target.value)} />{formData.testCases.length > 1 && <button type="button" onClick={() => removeTestCase(i)}>×</button>}</div>)}<button type="button" onClick={() => addTestCase(false)}>+ Add Test Case</button></div>
                <div className="test-cases-section"><h4>Hidden Test Cases (for judging)</h4>{formData.hiddenTestCases.map((tc, i) => <div key={i} className="test-case-row"><input placeholder="Input" value={tc.input} onChange={e => handleTestCaseChange(i, 'input', e.target.value, true)} /><input placeholder="Expected Output" value={tc.output} onChange={e => handleTestCaseChange(i, 'output', e.target.value, true)} />{formData.hiddenTestCases.length > 1 && <button type="button" onClick={() => removeTestCase(i, true)}>×</button>}</div>)}<button type="button" onClick={() => addTestCase(true)}>+ Add Hidden Test Case</button></div>
                {saveError && <div className="error-message">{saveError}</div>}
                <div className="form-actions"><button type="submit" className="save-btn">{editingProblem ? 'Update' : 'Save'}</button>{editingProblem && <button type="button" className="cancel-btn" onClick={resetForm}>Cancel</button>}</div>
              </form>
            </div>
            <div className="problems-list">
              <h2>Problems</h2>
              <table><thead><tr><th>Title</th><th>Round</th><th>Marks</th><th>Languages</th><th>Actions</th></tr></thead><tbody>{problems.map(p => <tr key={p._id}><td>{p.title}</td><td>{p.roundType === 1 ? 'Debug' : 'Coding'}</td><td>{p.marks || 10}</td><td>{p.supportedLanguages?.join(', ') || 'c'}</td><td><button onClick={() => handleEdit(p)}>Edit</button><button className="delete-btn" onClick={() => handleDelete(p._id)}>Delete</button></td></tr>)}</tbody></table>
            </div>
          </div>
        )}
        {activeTab === 'submissions' && (
          <div className="submissions-section">
            <h2>Submissions</h2>
            <table><thead><tr><th>User</th><th>Problem</th><th>Status</th><th>Marks</th></tr></thead><tbody>{submissions.map(s => <tr key={s._id}><td>{s.user?.name || 'Unknown'}</td><td>{s.problem?.title || 'Unknown'}</td><td>{s.status}</td><td>{s.marks || 0}</td></tr>)}</tbody></table>
          </div>
        )}
        {activeTab === 'leaderboard' && (
          <div className="leaderboard-section">
            <h2>Leaderboard</h2>
            <table><thead><tr><th>Name</th><th>Score</th><th>R1</th><th>R2</th><th>Time</th></tr></thead><tbody>{users.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0)).map(u => <tr key={u._id}><td>{u.name}</td><td><strong>{u.totalScore?.toFixed(2) || '0.00'}</strong></td><td>{u.round1Score?.toFixed(2) || '0.00'}</td><td>{u.round2Score?.toFixed(2) || '0.00'}</td><td>{u.totalTime ? `${u.totalTime.toFixed(2)}s` : '-'}</td></tr>)}</tbody></table>
          </div>
        )}
      </div>
    </div>
  );
}
