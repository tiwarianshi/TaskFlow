import { useCallback, useEffect, useRef, useState } from "react";
import { getCalendarTasks } from "../api/calendarApi";

export function useCalendar(params = {}) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestIdRef = useRef(0);
  const { month, year, board, assignee, priority, status } = params;

  const refresh = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setLoading(true);
    setError(null);

    try {
      const data = await getCalendarTasks({
        month,
        year,
        board,
        assignee,
        priority,
        status,
      });

      if (requestIdRef.current === requestId) {
        setTasks(data);
      }
    } catch (err) {
      if (requestIdRef.current === requestId) {
        setError(err?.response?.data?.message || "Failed to load calendar tasks");
        setTasks([]);
      }
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [assignee, board, month, priority, status, year]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      refresh();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      requestIdRef.current += 1;
    };
  }, [refresh]);

  return {
    tasks,
    loading,
    error,
    refresh,
  };
}

export default useCalendar;
