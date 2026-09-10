/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Calendar Alert Toast
 *
 * Surfaces calendar entries due today in the same terse "CAL:" military
 * log format used in Logs.tsx. One alert per entry, shown once per day.
 */

import React from 'react';
import { useLogs } from '#client/queries';
import { isRouteActive } from '#client/stores/router';
import dayjs from '#client/utils/dayjs';

interface DueEntry {
  date: string;
  text: string;
  entryType: string;
}

const SEEN_KEY = 'calendar_alerts_seen';

function getSeenIds(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch (_) {
    return new Set();
  }
}

function markSeen(ids: string[]) {
  try {
    const seen = getSeenIds();
    ids.forEach(id => seen.add(id));
    // Bound growth — keep the most recent 100 seen ids.
    const arr = Array.from(seen).slice(-100);
    localStorage.setItem(SEEN_KEY, JSON.stringify(arr));
  } catch (_) {}
}

export function CalendarAlertToast() {
  const { data: logs = [] } = useLogs();
  const [queue, setQueue] = React.useState<DueEntry[]>([]);
  const [current, setCurrent] = React.useState<DueEntry | null>(null);
  const [visible, setVisible] = React.useState(false);

  // Scan today's calendar entries for unseen due-today alerts.
  React.useEffect(() => {
    const checkDue = () => {
      const today = dayjs().format('YYYY-MM-DD');
      const seen = getSeenIds();

      const due = logs
        .filter(log => log.event === 'calendar_entry' && log.metadata?.date === today)
        .map(log => ({
          id: `${log.id}`,
          date: today,
          text: (log.metadata?.text as string) || log.text || '',
          entryType: (log.metadata?.entryType as string) || 'note',
        }))
        .filter(e => e.text && !seen.has(e.id));

      if (due.length === 0) return;

      markSeen(due.map(e => e.id));
      setQueue(prev => [...prev, ...due.map(({ date, text, entryType }) => ({ date, text, entryType }))]);
    };

    checkDue();
    const interval = setInterval(() => {
      if (document.hidden || !isRouteActive('system')) return;
      checkDue();
    }, 30000);
    return () => clearInterval(interval);
  }, [logs]);

  // Advance the queue one alert at a time.
  React.useEffect(() => {
    if (current || queue.length === 0) return;
    const [next, ...rest] = queue;
    setCurrent(next);
    setQueue(rest);
    setVisible(true);

    const hideTimer = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(hideTimer);
  }, [queue, current]);

  React.useEffect(() => {
    if (visible || !current) return;
    const clearTimer = setTimeout(() => setCurrent(null), 500);
    return () => clearTimeout(clearTimer);
  }, [visible, current]);

  if (!current) return null;

  return (
    <div
      className="fixed bottom-16 left-1/2 transform -translate-x-1/2 z-50
                 px-16 py-8 border border-[rgb(var(--acc-color-default)/0.2)]
                 bg-[var(--base-color)] grid-fill-light font-mono"
      style={{
        animation: visible
          ? 'fadeInUp 0.5s ease-out'
          : 'fadeOut 0.5s ease-in forwards',
      }}
    >
      <div className="text-center">
        <div className="opacity-40 uppercase tracking-widest mb-4">CAL:</div>
        <div className="uppercase tracking-widest">{current.entryType}</div>
        <div className="opacity-60 mt-4">{current.text}</div>
        <div className="opacity-30 mt-4 tracking-widest">TODAY</div>
      </div>
    </div>
  );
}

// CSS animations — same keyframe names/timings as EvolutionMilestoneToast.
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translate(-50%, 10px);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
`;

if (typeof document !== 'undefined') {
  document.head.appendChild(style);
}
