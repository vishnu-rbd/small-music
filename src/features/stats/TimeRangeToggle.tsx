import type { TimeRange } from '../../types/spotify';

export interface TimeRangeOption {
  value: TimeRange;
  label: string;
  description: string;
}

export const TIME_RANGE_OPTIONS: readonly TimeRangeOption[] = [
  {
    value: 'short_term',
    label: '~4 weeks',
    description: 'Approximately the last 4 weeks',
  },
  {
    value: 'medium_term',
    label: '~6 months',
    description: 'Approximately the last 6 months',
  },
  {
    value: 'long_term',
    label: 'All time',
    description: 'All time (Spotify computes this over about a year)',
  },
] as const;

interface TimeRangeToggleProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
}

/** Three-way switch between Spotify's `time_range` values. */
export function TimeRangeToggle({ value, onChange }: TimeRangeToggleProps) {
  return (
    <div
      role="group"
      aria-label="Time range"
      className="inline-flex rounded-full border border-neutral-700 bg-neutral-900 p-1"
    >
      {TIME_RANGE_OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            title={option.description}
            onClick={() => onChange(option.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              selected ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-300 hover:text-neutral-100'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
