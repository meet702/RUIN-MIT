import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";

const HOURS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0"));

function splitTime(value) {
  const [hour = "", minute = ""] = value ? value.split(":") : [];
  return { hour, minute };
}

export default function TimePickerField({ label, value, onChange, required = false, align = "left" }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const { hour, minute } = splitTime(value);

  useEffect(() => {
    function handlePointerDown(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const updateTime = (nextHour, nextMinute) => {
    onChange(`${nextHour}:${nextMinute}`);
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
          {value || "--:--"}
        </span>
        <Clock size={18} className={isOpen ? "text-ruin-orange" : "text-ruin-text"} />
      </button>
      <input required={required} value={value} onChange={() => {}} className="sr-only" tabIndex={-1} />

      {isOpen && (
        <div
          className={`absolute top-full z-[70] mt-2 w-full min-w-[16rem] rounded-lg border border-ruin-orange/45 bg-[#111111] p-3 shadow-2xl shadow-black/60 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <div className="mb-3 grid grid-cols-2 gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-ruin-muted">
            <span>Hour</span>
            <span>Minute</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="max-h-56 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-1">
                {HOURS.map((option) => {
                  const isSelected = option === hour;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => updateTime(option, minute || "00")}
                      className={`rounded-md px-3 py-2 font-heading text-sm font-semibold transition ${
                        isSelected
                          ? "bg-ruin-orange text-ruin-background shadow-[0_0_16px_rgba(242,101,34,0.28)]"
                          : "text-ruin-text hover:bg-ruin-orange/15 hover:text-ruin-orange"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto pl-1">
              <div className="grid grid-cols-2 gap-1">
                {MINUTES.map((option) => {
                  const isSelected = option === minute;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => updateTime(hour || "00", option)}
                      className={`rounded-md px-3 py-2 font-heading text-sm font-semibold transition ${
                        isSelected
                          ? "bg-ruin-orange text-ruin-background shadow-[0_0_16px_rgba(242,101,34,0.28)]"
                          : "text-ruin-text hover:bg-ruin-orange/15 hover:text-ruin-orange"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="mt-3 w-full rounded-md border border-ruin-orange/50 bg-ruin-orange/12 px-3 py-2 font-heading text-sm font-semibold text-ruin-orange transition hover:bg-ruin-orange hover:text-ruin-background"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
