const axios = require('axios');
require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('./models/problem');

const API_URL = process.env.API_URL || 'http://localhost:3000';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fix-solve';
const USER_COUNT = 85; // Simulating 80+ students

async function runLoadTest() {
    console.log('=========================================');
    console.log('      FIX & SOLVE LOAD TEST UTILITY      ');
    console.log('=========================================');
    console.log(`Target: ${API_URL}`);
    console.log(`Concurrent Users: ${USER_COUNT}`);
    console.log('-----------------------------------------');

    try {
        // 1. Connect to DB to get a valid problem ID
        console.log('Connecting to MongoDB to fetch test data...');
        await mongoose.connect(MONGO_URI);
        const problem = await Problem.findOne({ roundType: 1 });
        if (!problem) {
            console.error('Error: No Round 1 problem found in database. Please run npm run seed first.');
            process.exit(1);
        }
        const problemId = problem._id.toString();
        mongoose.connection.close();
        console.log(`Test Problem: "${problem.title}" (ID: ${problemId})`);

        // 2. Simulate Registration
        console.log('\n[Phase 1] Randomly generating and registering users...');
        const regStart = Date.now();
        const registrationPromises = [];

        for (let i = 1; i <= USER_COUNT; i++) {
            const name = `loadtest_user_${Date.now()}_${i}`;
            registrationPromises.push(
                axios.post(`${API_URL}/api/users/register`, {
                    name: name,
                    rollNumber: `LT-${i}`
                }).catch(err => {
                    return { error: true, message: err.message };
                })
            );
        }

        const registrationResults = await Promise.all(registrationPromises);
        const users = registrationResults.filter(r => !r.error).map(r => r.data);
        const regEnd = Date.now();

        console.log(`Success: ${users.length}/${USER_COUNT}`);
        console.log(`Time taken: ${(regEnd - regStart) / 1000}s`);

        if (users.length === 0) {
            console.error('Critical Error: Failed to register any users. Check if backend is running.');
            process.exit(1);
        }

        // 3. Simulate Timer Start
        console.log('\n[Phase 2] Starting individual asynchronous timers...');
        const timerStart = Date.now();
        const timerPromises = users.map(user =>
            axios.post(`${API_URL}/api/contests/start-timer`, {
                userId: user._id,
                round: 1,
                durationSecs: 1800
            }).catch(err => ({ error: true }))
        );

        await Promise.all(timerPromises);
        const timerEnd = Date.now();
        console.log(`Timers initialized in ${(timerEnd - timerStart) / 1000}s`);

        // 4. Simulate Concurrent Submissions
        console.log('\n[Phase 3] Simulating concurrent code submissions (Python)...');
        console.log('Wait for Judge0 to process all requests...');
        const subStart = Date.now();

        // Correct solution for the "Fix the Sum Function" in Python
        const correctPythonCode = `def add(a, b):
    return a + b

if __name__ == "__main__":
    import sys
    data = sys.stdin.read().strip().split()
    if len(data) >= 2:
        a, b = int(data[0]), int(data[1])
        print(add(a, b))`;

        const submissionPromises = users.map(user =>
            axios.post(`${API_URL}/api/submissions`, {
                problemId: problemId,
                code: correctPythonCode,
                language: 'python',
                userId: user._id,
                round: 1
            }, { timeout: 60000 }).catch(err => ({ error: true, msg: err.message }))
        );

        const submissionResults = await Promise.all(submissionPromises);
        const subEnd = Date.now();

        const results = submissionResults.map(r => {
            if (r.error) return 'FAILED';
            if (r.data && r.data.result && r.data.result.summary && r.data.result.summary.allPassed) return 'ACCEPTED';
            return 'REJECTED';
        });

        const accepted = results.filter(r => r === 'ACCEPTED').length;
        const failed = results.filter(r => r === 'FAILED').length;
        const rejected = results.filter(r => r === 'REJECTED').length;

        console.log(`\nResults Summary:`);
        console.log(`- Total Submissions: ${USER_COUNT}`);
        console.log(`- Accepted: ${accepted}`);
        console.log(`- Rejected (wrong answer): ${rejected}`);
        console.log(`- Failed (timeout/error): ${failed}`);
        console.log(`- Total Time for Submissions: ${(subEnd - subStart) / 1000}s`);
        console.log(`- Average response time: ${((subEnd - subStart) / USER_COUNT).toFixed(2)}ms`);

        console.log('\n=========================================');
        if (accepted === users.length) {
            console.log('   RESULT: SUCCESS (System Scaled Well)  ');
        } else if (accepted > 0) {
            console.log('   RESULT: PARTIAL SUCCESS               ');
        } else {
            console.log('   RESULT: FAILURE                       ');
        }
        console.log('=========================================');

    } catch (error) {
        console.error('Fatal load test error:', error.message);
    } finally {
        process.exit(0);
    }
}

runLoadTest();
