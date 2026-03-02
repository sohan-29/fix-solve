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

    const reportViolation = useCallback(async () => {
        if (!userId || reportingRef.current) return;
        reportingRef.current = true;

        try {
            const res = await axios.post('/api/contests/report-violation', { userId });
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
            if (document.hidden) {
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
