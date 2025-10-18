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
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const dpModifiersStyles = React.useMemo<DPModifiersStyles>(() => {
    if (!isDark) return {} as DPModifiersStyles;
    const selectedBg = '#60a5fa'; // blue-400
    const selectedText = '#0b1220'; // near-black for readability on blue
    const rangeBg = '#1f4e5f'; // teal-ish bar for middle range
    const rangeText = '#e5e7eb';
    const outsideText = '#475569';
    // const todayRing = '#94a3b8';
    return {
      selected: { backgroundColor: selectedBg, color: selectedText, borderRadius: '9999px' },
      range_start: { backgroundColor: selectedBg, color: selectedText, borderRadius: '9999px' },
      range_end: { backgroundColor: selectedBg, color: selectedText, borderRadius: '9999px' },
      range_middle: { backgroundColor: rangeBg, color: rangeText, borderRadius: 0 },
      outside: { color: outsideText },
      today: { color: '#2d7dfc' },
    } as DPModifiersStyles;
  }, [isDark]);

  const dpStyles = React.useMemo(() => {
    if (!isDark) return {};
    return {
      caption_label: { color: '#e5e7eb', fontWeight: 700 },
      head_cell: { color: '#9ca3af', fontWeight: 600 },
      nav_button: { color: '#e5e7eb' },
      day: { color: '#e5e7eb' },
    } as const;
  }, [isDark]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto justify-start gap-2">
          <FiCalendar className="h-4 w-4" />
          <span className="truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-3 w-auto" align="end">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="sm:border-r sm:pr-3">
            <div className="flex gap-2 mb-2">
              <Button size="sm" variant="secondary" onClick={() => setPreset(7)}>7 Hari</Button>
              <Button size="sm" variant="secondary" onClick={() => setPreset(30)}>30 Hari</Button>
              <Button size="sm" variant="secondary" onClick={() => setPreset(90)}>90 Hari</Button>
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
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
