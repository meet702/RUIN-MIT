import { useCallback, useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const PERIODS = ["AM", "PM"];

function pad(v) {
  return String(v).padStart(2, "0");
}

function parseTime(value) {
  if (!value) return { hour: 12, minute: 0, period: "AM" };
  const [rh = "", rm = ""] = value.split(":");
  const h24 = Number(rh);
  const m = Number(rm);
  if (!Number.isFinite(h24)) return { hour: 12, minute: 0, period: "AM" };
  return {
    hour: h24 % 12 || 12,
    minute: Number.isFinite(m) ? m : 0,
    period: h24 >= 12 ? "PM" : "AM",
  };
}

function toTimeValue({ hour, minute, period }) {
  const h24 = period === "PM" ? (hour % 12) + 12 : hour % 12;
  return `${pad(h24)}:${pad(minute)}`;
}

function formatDisplay(value) {
  if (!value) return "";
  const t = parseTime(value);
  return `${pad(t.hour)}:${pad(t.minute)} ${t.period}`;
}

/* ── ScrollColumn (infinite loop) ──────────────────────────────────── */
const ITEM_H = 48;
const VISIBLE = 5;
const COL_H = ITEM_H * VISIBLE;
const PAD_ITEMS = Math.floor(VISIBLE / 2);
const COPIES = 5;          // repeat items this many times
const MID_COPY = Math.floor(COPIES / 2); // index of the "home" copy

function ScrollColumn({ items, value, onChange, formatItem = String }) {
  const listRef = useRef(null);
  const suppressSnap = useRef(false);
  const snapTimer = useRef(null);
  const len = items.length;
  const canLoop = len > 2; // only loop if enough items (skip AM/PM)

  // Position of `value` inside one copy
  const idx = items.indexOf(value);

  // The scroll offset that places `value` in the center of the middle copy
  const homeOffset = canLoop
    ? (MID_COPY * len + idx) * ITEM_H
    : idx * ITEM_H;

  // Jump to the selected item (no looping animation)
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    suppressSnap.current = true;
    el.scrollTo({ top: homeOffset, behavior: "smooth" });
    clearTimeout(snapTimer.current);
    snapTimer.current = setTimeout(() => { suppressSnap.current = false; }, 400);
  }, [homeOffset]);

  const handleScroll = useCallback(() => {
    if (suppressSnap.current) return;
    const el = listRef.current;
    if (!el) return;

    clearTimeout(snapTimer.current);
    snapTimer.current = setTimeout(() => {
      if (!el) return;
      const scrollTop = el.scrollTop;

      if (canLoop) {
        // Total height of one copy
        const oneSetH = len * ITEM_H;
        // If scrolled outside the middle copy range, silently teleport back
        const lowBound = oneSetH;            // top of copy 1
        const highBound = (COPIES - 1) * oneSetH; // top of last copy
        if (scrollTop < lowBound || scrollTop >= highBound) {
          // Find which item index we're closest to
          const rawIdx = Math.round(scrollTop / ITEM_H) % len;
          const safeIdx = ((rawIdx % len) + len) % len;
          const resetTop = (MID_COPY * len + safeIdx) * ITEM_H;
          suppressSnap.current = true;
          el.scrollTop = resetTop; // instant jump (no smooth)
          setTimeout(() => { suppressSnap.current = false; }, 50);
          if (items[safeIdx] !== value) onChange(items[safeIdx]);
          return;
        }

        // Normal snap inside middle region
        const nearest = Math.round(scrollTop / ITEM_H);
        const itemIdx = ((nearest % len) + len) % len;
        suppressSnap.current = true;
        const snapTop = (MID_COPY * len + itemIdx) * ITEM_H;
        el.scrollTo({ top: snapTop, behavior: "smooth" });
        setTimeout(() => { suppressSnap.current = false; }, 300);
        if (items[itemIdx] !== value) onChange(items[itemIdx]);
      } else {
        // Non-looping (AM/PM)
        const nearest = Math.round(scrollTop / ITEM_H);
        const clamped = Math.max(0, Math.min(nearest, len - 1));
        suppressSnap.current = true;
        el.scrollTo({ top: clamped * ITEM_H, behavior: "smooth" });
        setTimeout(() => { suppressSnap.current = false; }, 300);
        if (items[clamped] !== value) onChange(items[clamped]);
      }
    }, 60);
  }, [items, len, value, onChange, canLoop]);

  useEffect(() => () => clearTimeout(snapTimer.current), []);

  // Build the rendered list: repeat items COPIES times (or just once for AM/PM)
  const repeatCount = canLoop ? COPIES : 1;

  // For styling, figure out which flat index is "selected" so we can color neighbors
  const selectedFlat = canLoop ? MID_COPY * len + idx : idx;

  return (
    <div className="relative" style={{ height: COL_H, minWidth: 56 }}>
      {/* highlight bar behind center item */}
      <div
        className="pointer-events-none absolute inset-x-0 z-10 rounded-lg border border-ruin-orange/30 bg-ruin-orange/10"
        style={{ top: PAD_ITEMS * ITEM_H, height: ITEM_H }}
      />
      {/* fade top */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-20 rounded-t-lg"
        style={{ height: ITEM_H * 2, background: "linear-gradient(to bottom, #111111 10%, transparent 100%)" }}
      />
      {/* fade bottom */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 rounded-b-lg"
        style={{ height: ITEM_H * 2, background: "linear-gradient(to top, #111111 10%, transparent 100%)" }}
      />

      <div
        ref={listRef}
        onScroll={handleScroll}
        className="relative z-0 h-full overflow-y-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
      >
        {/* top spacer */}
        {Array.from({ length: PAD_ITEMS }).map((_, i) => (
          <div key={`t${i}`} style={{ height: ITEM_H }} />
        ))}

        {Array.from({ length: repeatCount }).flatMap((_, copyIdx) =>
          items.map((item, i) => {
            const flatIdx = copyIdx * len + i;
            const dist = Math.abs(flatIdx - selectedFlat);
            const isSelected = item === value && dist === 0;
            return (
              <button
                key={`${copyIdx}-${item}`}
                type="button"
                onClick={() => onChange(item)}
                className="flex w-full items-center justify-center transition-all"
                style={{
                  height: ITEM_H,
                  fontSize: isSelected ? 24 : 16,
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? "#f0f0f0" : dist <= 1 ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.15)",
                  fontFamily: "var(--font-heading, inherit)",
                }}
              >
                {formatItem(item)}
              </button>
            );
          })
        )}

        {/* bottom spacer */}
        {Array.from({ length: PAD_ITEMS }).map((_, i) => (
          <div key={`b${i}`} style={{ height: ITEM_H }} />
        ))}
      </div>
    </div>
  );
}

/* ── TimePickerField ───────────────────────────────────────────────── */
export default function TimePickerField({ label, value, onChange, required = false, align = "left" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState("bottom");
  const [draft, setDraft] = useState(() => parseTime(value));
  const wrapperRef = useRef(null);

  // close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, []);

  // sync draft when popup reopens
  useEffect(() => {
    if (!isOpen) setDraft(parseTime(value));
  }, [isOpen, value]);

  // placement
  useEffect(() => {
    if (!isOpen || !wrapperRef.current) return;
    const update = () => {
      const r = wrapperRef.current.getBoundingClientRect();
      const below = window.innerHeight - r.bottom - 12;
      const above = r.top - 12;
      setPlacement(below < 320 && above > below ? "top" : "bottom");
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [isOpen]);

  const set = (field, v) => setDraft((d) => ({ ...d, [field]: v }));

  const commit = () => {
    onChange(toTimeValue(draft));
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <span className="text-sm font-medium text-ruin-text">{label}</span>

      {/* trigger — identical to DatePickerField */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className={`mt-2 flex w-full items-center justify-between rounded-lg border bg-ruin-background px-4 py-3 text-left text-ruin-text outline-none transition ${
          isOpen ? "border-ruin-orange shadow-[0_0_0_1px_rgba(242,101,34,0.45)]" : "border-ruin-border"
        }`}
      >
        <span className={value ? "font-heading text-lg font-semibold" : "text-ruin-muted"}>
          {formatDisplay(value) || "hh : mm"}
        </span>
        <Clock size={18} className={isOpen ? "text-ruin-orange" : "text-ruin-text"} />
      </button>

      <input required={required} value={value} onChange={() => {}} className="sr-only" tabIndex={-1} />

      {/* popover */}
      {isOpen && (
        <div
          className={`absolute z-[70] rounded-lg border border-ruin-orange/45 bg-[#111111] p-5 shadow-2xl shadow-black/60 ${
            placement === "top" ? "bottom-full mb-2" : "top-full mt-2"
          } ${align === "right" ? "right-0" : "left-0"}`}
          style={{ width: "min(22rem, calc(100vw - 2rem))" }}
        >
          {/* 3-column layout: Hours  :  Minutes  |  AM/PM */}
          <div className="flex items-center justify-center gap-0">
            {/* Hours */}
            <ScrollColumn
              items={HOURS}
              value={draft.hour}
              onChange={(v) => set("hour", v)}
            />

            {/* colon separator */}
            <div className="flex items-center justify-center px-1" style={{ height: COL_H }}>
              <span className="text-2xl font-bold text-ruin-muted">:</span>
            </div>

            {/* Minutes */}
            <ScrollColumn
              items={MINUTES}
              value={draft.minute}
              onChange={(v) => set("minute", v)}
              formatItem={pad}
            />

            {/* divider */}
            <div className="mx-3 h-24 w-px bg-ruin-border" />

            {/* AM / PM */}
            <ScrollColumn
              items={PERIODS}
              value={draft.period}
              onChange={(v) => set("period", v)}
            />
          </div>

          {/* footer */}
          <div className="mt-4 flex items-center justify-end gap-4 border-t border-ruin-border pt-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md px-3 py-1.5 font-heading text-xs font-semibold uppercase text-ruin-muted transition hover:text-ruin-text"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={commit}
              className="rounded-md bg-ruin-orange px-5 py-1.5 font-heading text-xs font-bold uppercase text-ruin-background transition hover:bg-ruin-orange/85"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
