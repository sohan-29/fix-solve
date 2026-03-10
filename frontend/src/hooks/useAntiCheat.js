import { useEffect, useState, useCallback, useRef } from 'react';
import axios from '../api';

const MAX_WARNINGS = 1; // 1 warning, then lockout on repeat

/**
 * useAntiCheat — Page Visibility API hook
 *
 * Detects when the participant switches away from the contest tab.
 * - 1st switch  → warning (banner shown).
 * - 2nd switch  → auto-lockout (overlay blocks the page).
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

    useEffect(() => {
        if (!userId) return;

        const handleVisibilityChange = () => {
            // Only trigger when the page becomes hidden (user switched away)
            // Also check if we're on a contest page (not admin, home, instructions, results, etc.)
            const currentPath = window.location.pathname;
            const isContestPage = currentPath === '/round1' || currentPath === '/round2';

            // Only report violation if on contest pages
            if (document.hidden && isContestPage) {
                reportViolation();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [userId, reportViolation]);

    return { warnings, isLockedOut, MAX_WARNINGS };
}
