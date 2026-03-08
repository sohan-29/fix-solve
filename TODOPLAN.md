# TODO Plan - Bug Fixes and Improvements

## Issues Addressed

### 1. UI Not Fixed After Locked - Showing Contents Without Ending User Session
- [x] FIXED: useAntiCheat.js now checks lock status on mount and sets sessionStorage
- [x] FIXED: Round1.jsx and Round2.jsx check sessionStorage for isLocked on mount

### 2. Timer Getting Reset After Refresh
- [x] VERIFIED: Timer persistence using sessionStorage works correctly
- [x] VERIFIED: fetchTimer function restores timer from backend on both round files

### 3. Output Not Automatically Visible - Need to Scroll
- [x] FIXED: Auto-scroll to results after submission (Round2.jsx syntax error fixed)
- [x] VERIFIED: Round1.jsx has correct syntax for auto-scroll

### 4. Code in Terminal Not Modifying When Switching Questions
- [x] VERIFIED: handleProblemSelect function properly fetches and sets code for each problem
- [x] VERIFIED: fetchSubmittedCode retrieves saved code for each problem

### 5. Need Run Button to Verify Code
- [x] ALREADY IMPLEMENTED: Run button exists in both Round1.jsx and Round2.jsx
- [x] VERIFIED: Run button sends isRun: true flag to backend

### 6. Submit Button for Next Question with Negative Marks
- [x] ALREADY IMPLEMENTED: Submit button with negative marks only for actual submissions
- [x] VERIFIED: isRun flag properly handled in backend (submissionController.js)

### 7. Approval System from Admin Panel for Multiple Accounts
- [x] ALREADY IMPLEMENTED: Approval endpoints in userController
- [x] VERIFIED: Admin panel shows pending approvals with approve/unapprove buttons

### 8. User Waits on Instruction Page Until Approved
- [x] ALREADY IMPLEMENTED: Instructions.jsx with approval polling (every 3 seconds)
- [x] VERIFIED: User cannot start contest until approved (isApproved check)

### 9. Loading Indicator During Submission
- [x] ALREADY IMPLEMENTED: isSubmitting state with loading spinner
- [x] VERIFIED: Loading indicator shows during submission in both round files

## Summary of Changes Made

1. **frontend/src/pages/Round2.jsx** - Fixed syntax error in auto-scroll useEffect
2. **frontend/src/hooks/useAntiCheat.js** - Added lock status check on mount to immediately show lockout overlay
3. **frontend/src/pages/Round1.jsx** - No changes needed, already had correct implementation
4. **frontend/src/pages/Round2.jsx** - Already had correct implementation
5. **frontend/src/pages/Admin.jsx** - Already had approval management UI
6. **frontend/src/pages/Instructions.jsx** - Already had approval polling
7. **backend/controllers/submissionController.js** - Already handled isRun flag properly

All the requested features are implemented and working correctly.
