import { useEffect, useState, useCallback, useRef } from 'react';
import axios from '../api';

const MAX_WARNINGS = 1; // 1 warning allowed, lockout on 2nd

/**
 * useAntiCheat — Page Visibility API hook
 *
 * Detects when the participant switches away from the contest tab.
 * - 1st switch  → auto-lockout (overlay blocks the page).
 *
 * Each violation is reported to the backend so lockout is enforced server-side too.
 *
 * @param {string|null} userId - The logged-in participant's MongoDB _id.
 * @returns {{ warnings: number, isLockedOut: boolean, MAX_WARNINGS: number }}
 */
export default function useAntiCheat(userId) {
    const [warnings, setWarnings] = useState(0);
    const [isLockedOut, setIsLockedOut] = useState(false);
    const reportingRef = useRef(false); // guard against duplicate rapid-fire calls

    // Check lock status on mount
    useEffect(() => {
        if (!userId) return;

        const checkLockStatus = async () => {
            try {
                const res = await axios.get(`/users/${userId}`);
                if (res.data.isLockedOut) {
                    setIsLockedOut(true);
                    sessionStorage.setItem('isLocked', 'true');
                } else {
                    setIsLockedOut(false);
                    sessionStorage.removeItem('isLocked');
                }
                if (res.data.tabSwitchCount) {
                    setWarnings(res.data.tabSwitchCount);
                }
            } catch (err) {
                console.error('Error checking lock status:', err);
            }
        };

        checkLockStatus();
    }, [userId]);

    const reportViolation = useCallback(async () => {
        if (!userId || reportingRef.current) return;
        reportingRef.current = true;

        try {
            const res = await axios.post('/contests/report-violation', { userId });
            const data = res.data;
            setWarnings(data.tabSwitchCount);
            if (data.isLockedOut) {
                setIsLockedOut(true);
            }
        } catch (err) {
            console.error('Failed to report violation:', err);
        } finally {
            reportingRef.current = false;
        }
    }, [userId]);

    const timeoutRef = useRef(null);

    useEffect(() => {
        if (!userId) return;

        const handleVisibilityChange = () => {
            const currentPath = window.location.pathname;
            const isContestPage = currentPath === '/round1' || currentPath === '/round2';

            if (document.hidden && isContestPage) {
                // Add a small delay to debounce rapid switches/false positives
                timeoutRef.current = setTimeout(() => {
                    if (document.hidden) {
                        reportViolation();
                    }
                }, 500);
            } else {
                // If they came back before the timeout, clear it
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [userId, reportViolation]);

    return { warnings, isLockedOut, MAX_WARNINGS };
}
