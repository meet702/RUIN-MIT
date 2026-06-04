import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function pad(value) {
  return String(value).padStart(2, "0");
}

function parseDate(value) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function toDateValue(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function formatDate(value) {
  const date = parseDate(value);
  if (!date) return "";
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
}

export default function DatePickerField({ label, value, onChange, required = false, align = "left" }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedDate = parseDate(value);
  const initialMonth = selectedDate || new Date();
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1)
  );
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handlePointerDown(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (selectedDate) {
      setVisibleMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  }, [value]);

  const days = useMemo(() => {
    const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const gridStart = new Date(firstDay);
    gridStart.setDate(firstDay.getDate() - firstDay.getDay());

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      return date;
    });
  }, [visibleMonth]);

  const moveMonth = (offset) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  return (
    <div ref={wrapperRef} className="relative">
      <span className="text-sm font-medium text-ruin-text">{label}</span>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`mt-2 flex w-full items-center justify-between rounded-lg border bg-ruin-background px-4 py-3 text-left text-ruin-text outline-none transition ${
          isOpen ? "border-ruin-orange shadow-[0_0_0_1px_rgba(242,101,34,0.45)]" : "border-ruin-border"
        }`}
      >
        <span className={value ? "font-heading text-lg font-semibold" : "text-ruin-muted"}>
          {formatDate(value) || "dd-mm-yyyy"}
        </span>
        <Calendar size={18} className={isOpen ? "text-ruin-orange" : "text-ruin-text"} />
      </button>
      <input required={required} value={value} onChange={() => {}} className="sr-only" tabIndex={-1} />

      {isOpen && (
        <div
          className={`absolute top-full z-[70] mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-lg border border-ruin-orange/45 bg-[#111111] p-4 shadow-2xl shadow-black/60 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => moveMonth(-1)}
              className="rounded-md border border-ruin-border p-2 text-ruin-text transition hover:border-ruin-orange hover:text-ruin-orange"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <p className="font-heading text-sm font-semibold text-ruin-text">
              {MONTH_NAMES[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
            </p>
            <button
              type="button"
              onClick={() => moveMonth(1)}
              className="rounded-md border border-ruin-border p-2 text-ruin-text transition hover:border-ruin-orange hover:text-ruin-orange"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((day) => (
              <span key={day} className="py-1 text-xs font-semibold text-ruin-muted">
                {day}
              </span>
            ))}

            {days.map((date) => {
              const dateValue = toDateValue(date);
              const isSelected = dateValue === value;
              const isCurrentMonth = date.getMonth() === visibleMonth.getMonth();
              const isDisabled = date < startOfToday();

              return (
                <button
                  key={dateValue}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    onChange(dateValue);
                    setIsOpen(false);
                  }}
                  className={`aspect-square rounded-md text-sm font-semibold transition ${
                    isDisabled
                      ? "cursor-not-allowed text-ruin-muted/25 line-through"
                      : isSelected
                      ? "bg-ruin-orange text-ruin-background shadow-[0_0_18px_rgba(242,101,34,0.32)]"
                      : isCurrentMonth
                        ? "text-ruin-text hover:bg-ruin-orange/15 hover:text-ruin-orange"
                        : "text-ruin-muted/45 hover:bg-ruin-orange/10 hover:text-ruin-orange"
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
