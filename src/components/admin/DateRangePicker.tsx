"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import { id } from "date-fns/locale";
import { DayPicker, DateRange as RDPDateRange, type Styles as DPStyles, type ModifiersStyles as DPModifiersStyles } from "react-day-picker";
import "react-day-picker/style.css";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FiCalendar } from "react-icons/fi";
import { useTheme } from "next-themes";

export type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateRangePicker({ value, onChange }: Props) {
  const [open, setOpen] = React.useState(false);
  const today = React.useMemo(() => new Date(), []);
  const computeLeftMonth = React.useCallback((from?: Date, to?: Date): Date => {
    if (from) return new Date(from.getFullYear(), from.getMonth(), 1);
    const base = to ?? today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  }, [today]);

  const [month, setMonth] = React.useState<Date>(computeLeftMonth(value.from, value.to));

  // Keep visible month in sync when external value changes
  React.useEffect(() => {
    setMonth(computeLeftMonth(value.from ?? undefined, value.to ?? undefined));
  }, [value.from, value.to, computeLeftMonth]);

  const label = React.useMemo(() => {
    if (value.from && value.to) {
      return `${format(value.from, "d MMM yyyy", { locale: id })} - ${format(value.to, "d MMM yyyy", { locale: id })}`;
    }
    if (value.from) return `${format(value.from, "d MMM yyyy", { locale: id })}`;
    return "Pilih rentang tanggal";
  }, [value]);

  const setPreset = (days: number) => {
    const to = today;
    const from = addDays(to, -days + 1);
    onChange({ from, to });
    setMonth(computeLeftMonth(from, to));
  };
  // Theme-aware colors for dark mode DayPicker
  const { theme, resolvedTheme } = useTheme();
  const isDark = theme === 'dark' || resolvedTheme === 'dark';

  const dpModifiersStyles = React.useMemo<DPModifiersStyles>(() => {
    const outsideText = isDark ? '#475569' : '#94a3b8';
    const todayText = '#3b82f6';
    
    return {
      outside: { 
        color: outsideText 
      },
      today: { 
        color: todayText, 
        fontWeight: '700' 
      },
    } as DPModifiersStyles;
  }, [isDark]);

  const dpStyles = React.useMemo(() => {
    return {
      caption_label: { 
        color: isDark ? '#f3f4f6' : '#1f2937', 
        fontWeight: 700,
        fontSize: '15px'
      },
      head_cell: { 
        color: isDark ? '#9ca3af' : '#4b5563', 
        fontWeight: 600,
        fontSize: '13px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        paddingBottom: '8px'
      },
      nav_button: { 
        color: isDark ? '#f3f4f6' : '#1f2937' 
      },
      day: { 
        color: isDark ? '#e5e7eb' : '#374151',
        transition: 'all 0.15s ease'
      },
    } as const;
  }, [isDark]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:-translate-y-0.5 active:translate-y-0 shadow-sm transition-all duration-200 hover:bg-gray-50 dark:hover:bg-white/5 w-full sm:w-auto justify-center sm:justify-start"
        >
          <FiCalendar className="h-4 w-4 text-blue-500" />
          <span className="truncate">{label}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="p-4 w-auto rounded-2xl border border-gray-200 dark:border-white/5 bg-white dark:bg-gray-950 shadow-2xl backdrop-blur-xl" 
        align="end"
        style={{
          ['--rdp-day-height' as any]: '40px',
          ['--rdp-day-width' as any]: '40px',
          ['--rdp-day_button-height' as any]: '38px',
          ['--rdp-day_button-width' as any]: '38px',
        }}
      >
        <div className="flex flex-col gap-4">
          {/* Preset Buttons */}
          <div className="flex gap-2 border-b border-gray-100 dark:border-white/5 pb-3">
            {[
              { label: "7 Hari", days: 7 },
              { label: "30 Hari", days: 30 },
              { label: "90 Hari", days: 90 },
            ].map((preset) => (
              <button
                key={preset.days}
                onClick={() => setPreset(preset.days)}
                type="button"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 border border-gray-200/50 dark:border-white/5 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <DayPicker
            mode="range"
            selected={value as RDPDateRange}
            onSelect={(range) => onChange({ from: range?.from, to: range?.to })}
            numberOfMonths={2}
            month={month}
            onMonthChange={setMonth}
            captionLayout="dropdown"
            pagedNavigation
            fixedWeeks
            fromMonth={new Date(2023, 0, 1)}
            toMonth={today}
            disabled={{ after: today }}
            locale={id}
            weekStartsOn={1}
            showOutsideDays
            modifiersStyles={dpModifiersStyles}
            styles={dpStyles as unknown as DPStyles}
            style={{
              ['--rdp-accent-color' as any]: '#3b82f6',
              ['--rdp-accent-background-color' as any]: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.12)',
              ['--rdp-range_start-date-background-color' as any]: '#3b82f6',
              ['--rdp-range_end-date-background-color' as any]: '#3b82f6',
              ['--rdp-range_start-color' as any]: '#ffffff',
              ['--rdp-range_end-color' as any]: '#ffffff',
              ['--rdp-range_middle-background-color' as any]: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.12)',
              ['--rdp-range_middle-color' as any]: isDark ? '#60a5fa' : '#1e40af',
              ['--rdp-selected-border' as any]: '2px solid #3b82f6',
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
