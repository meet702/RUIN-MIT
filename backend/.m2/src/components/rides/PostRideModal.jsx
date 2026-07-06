import { useEffect, useState } from "react";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import DatePickerField from "../ui/DatePickerField";
import TimePickerField from "../ui/TimePickerField";

const VEHICLE_TYPES = ["auto", "car", "bike", "other"];

const initialForm = {
  vehicleType: "auto",
  fromLocation: "",
  toLocation: "",
  departureDate: "",
  departureTime: "",
  totalSeats: "",
  farePerPerson: "",
  notes: "",
};

export default function PostRideModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(initialForm);
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!open) return undefined;
    const handleEscape = (e) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open]);

  if (!open) return null;

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setError("");
      setForm(initialForm);
      onClose();
    }, 250);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
        setError("You must be logged in to offer a ride");
        return;
    }

    setIsLoading(true);
    setError("");

    const { departureDate, departureTime, ...rideFields } = form;
    const formattedData = {
        ...rideFields,
        departureTime: `${departureDate}T${departureTime}`,
        totalSeats: parseInt(form.totalSeats),
        farePerPerson: form.farePerPerson ? parseFloat(form.farePerPerson) : 0
    };

    const result = await onSubmit(formattedData);
    if (result && result.success) {
        closeModal();
    } else {
        setError(result?.message || "Failed to post ride");
    }
    
    setIsLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && closeModal()}
    >
      <form
        className={`w-full max-w-[520px] max-h-[90vh] overflow-y-auto rounded-2xl border border-ruin-border bg-ruin-card p-6 sm:p-8 ${
          isClosing ? "modal-exit" : "modal-enter"
        }`}
        onSubmit={handleSubmit}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-bold text-ruin-text">Offer a Ride</h2>
            <p className="mt-1 text-sm text-ruin-muted">Share your commute and split costs.</p>
          </div>
          <Button variant="ghost" className="-mr-2 -mt-2" onClick={closeModal} aria-label="Close modal">
            Close
          </Button>
        </div>

        {error && (
            <div className="mb-4 rounded bg-ruin-magenta/10 p-3 text-sm text-ruin-magenta">{error}</div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-ruin-text">From Location</span>
                <input
                  required
                  value={form.fromLocation}
                  onChange={(e) => updateField("fromLocation", e.target.value)}
                  className="mt-2 w-full rounded-lg border border-ruin-border bg-ruin-background px-4 py-3 text-ruin-text outline-none focus:border-ruin-orange"
                  placeholder="MIT Campus"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-ruin-text">To Location</span>
                <input
                  required
                  value={form.toLocation}
                  onChange={(e) => updateField("toLocation", e.target.value)}
                  className="mt-2 w-full rounded-lg border border-ruin-border bg-ruin-background px-4 py-3 text-ruin-text outline-none focus:border-ruin-orange"
                  placeholder="Pune Station"
                />
              </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DatePickerField
              required
              label="Departure Date"
              value={form.departureDate}
              onChange={(value) => updateField("departureDate", value)}
            />
            <TimePickerField
              required
              label="Departure Time"
              value={form.departureTime}
              align="right"
              onChange={(value) => updateField("departureTime", value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-ruin-text">Vehicle</span>
              <select
                required
                value={form.vehicleType}
                onChange={(e) => updateField("vehicleType", e.target.value)}
                className="mt-2 w-full rounded-lg border border-ruin-border bg-ruin-background px-4 py-3 text-ruin-text outline-none focus:border-ruin-orange capitalize"
              >
                {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-ruin-text">Seats</span>
              <input
                required
                type="number"
                min="1"
                max="10"
                value={form.totalSeats}
                onChange={(e) => updateField("totalSeats", e.target.value)}
                className="mt-2 w-full rounded-lg border border-ruin-border bg-ruin-background px-4 py-3 text-ruin-text outline-none focus:border-ruin-orange"
                placeholder="2"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-ruin-text">Fare (₹)</span>
              <input
                type="number"
                min="0"
                value={form.farePerPerson}
                onChange={(e) => updateField("farePerPerson", e.target.value)}
                className="mt-2 w-full rounded-lg border border-ruin-border bg-ruin-background px-4 py-3 text-ruin-text outline-none focus:border-ruin-orange"
                placeholder="100"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-ruin-text">Notes (Optional)</span>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              className="mt-2 w-full resize-none rounded-lg border border-ruin-border bg-ruin-background px-4 py-3 text-ruin-text outline-none focus:border-ruin-orange"
              placeholder="No heavy luggage please"
            />
          </label>
        </div>

        <Button type="submit" className="mt-7 w-full" disabled={isLoading}>
          {isLoading ? "Posting..." : "Offer Ride"}
        </Button>
      </form>
    </div>
  );
}
