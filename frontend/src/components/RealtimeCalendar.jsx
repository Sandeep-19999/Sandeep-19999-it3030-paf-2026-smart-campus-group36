import { useEffect, useMemo, useState } from 'react';

const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getWeekDates(baseDate) {
  const dayIndex = baseDate.getDay();
  const mondayOffset = dayIndex === 0 ? -6 : 1 - dayIndex;

  return WEEK_LABELS.map((label, index) => {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + mondayOffset + index);

    return {
      label,
      date,
      dayNumber: date.getDate()
    };
  });
}

export default function RealtimeCalendar() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const currentDateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }).format(now),
    [now]
  );

  const liveTimeLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(now),
    [now]
  );

  const week = useMemo(() => getWeekDates(now), [now]);

  return (
    <div className="course-calendar-box" aria-live="polite">
      <div className="course-calendar-header">
        <h3>Calendar</h3>
        <p>{currentDateLabel}</p>
      </div>

      <div className="course-calendar-grid">
        {week.map((item) => (
          <span key={`label-${item.label}`} className="course-calendar-day-label">{item.label}</span>
        ))}

        {week.map((item) => {
          const isToday =
            item.date.getDate() === now.getDate() &&
            item.date.getMonth() === now.getMonth() &&
            item.date.getFullYear() === now.getFullYear();

          return (
            <span
              key={item.date.toISOString()}
              className={isToday ? 'course-active-day' : 'muted'}
              aria-current={isToday ? 'date' : undefined}
            >
              {item.dayNumber}
            </span>
          );
        })}
      </div>

      <div className="course-calendar-meta">
        <a href="#">Full calendar</a>
        <span className="course-live-time">Live: {liveTimeLabel}</span>
      </div>
    </div>
  );
}
