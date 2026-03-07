# Implementation Plan - Fix & Solve Contest System Updates

## Phase 1: Timer and Session Fixes

### 1.1 Fix Timer Persistence
- **Issue**: Timer resets on refresh or problem switch
- **Solution**: Use sessionStorage properly and prevent timer reset on problem change
- **Files**: Round1.jsx, Round2.jsx

### 1.2 Fix UI After Lockout
- **Issue**: Locked users can see content on refresh
- **Solution**: Add check before rendering content, redirect if locked
- **Files**: Round1.jsx, Round2.jsx

## Phase 2: Code Editor Improvements

### 2.1 Fix Code Switching Issue
- **Issue**: Previous debug code shows when switching problems
- **Solution**: Properly save and load code per problem per user
- **Files**: Round1.jsx, Round2.jsx

### 2.2 Add Run Button
- **Issue**: No way to test code without submitting
- **Solution**: Add Run button that tests code without penalty
- **Files**: Round1.jsx, Round2.jsx, submissionController.js

## Phase 3: UI/UX Improvements

### 3.1 Auto-scroll to Results
- **Issue**: Output not automatically visible
- **Solution**: Auto-scroll to submission results after submission
- **Files**: Round1.jsx, Round2.jsx

### 3.2 Add Loading Indicator
- **Issue**: No feedback during submission
- **Solution**: Add spinner/loader during submission process
- **Files**: Round1.jsx, Round2.jsx

### 3.3 Improve Result Display
- **Issue**: Results need to be more user-friendly
- **Solution**: Make results more prominent and colorful
- **Files**: App.css

## Phase 4: Approval System

### 4.1 Add User Approval Feature
- **Issue**: Users can start without admin approval
- **Solution**: Add approval status to User model, instruction page waits for approval
- **Files**: User.js, Instructions.jsx, Home.jsx, userController.js, Admin.jsx

### 4.2 Admin Panel Updates
- **Issue**: No way to approve users
- **Solution**: Add approve button in admin panel
- **Files**: Admin.jsx

## Phase 5: Negative Marks Fix

### 5.1 Separate Run and Submit
- **Issue**: Negative marks applied on Run
- **Solution**: Only apply negative marks on Submit, not Run
- **Files**: Round1.jsx, Round2.jsx, submissionController.js

## Implementation Order:

1. Fix timer persistence in Round1.jsx and Round2.jsx
2. Fix lockout check and redirect
3. Add Run button functionality
4. Fix code switching between problems
5. Add loading indicator
6. Add auto-scroll to results
7. Add approval system (backend + frontend)
8. Fix negative marks for Run vs Submit

## Files to Modify:
- backend/models/User.js
- backend/controllers/userController.js
- backend/controllers/submissionController.js
- frontend/src/pages/Round1.jsx
- frontend/src/pages/Round2.jsx
- frontend/src/pages/Instructions.jsx
- frontend/src/pages/Home.jsx
- frontend/src/pages/Admin.jsx
- frontend/src/App.css
