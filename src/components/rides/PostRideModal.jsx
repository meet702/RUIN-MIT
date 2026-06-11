import { useEffect, useState } from "react";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import DatePickerField from "../ui/DatePickerField";
import TimePickerField from "../ui/TimePickerField";

const OFFER_VEHICLES = ["bike", "car"];
const CAR_SEATS = ["1", "2", "3"];
const AUTO_SEATS = ["1", "2"];

const initialForm = {
  rideMode: "offer",
  vehicleType: "bike",
  fromLocation: "",
  toLocation: "",
  departureDate: "",
  departureTime: "",
  totalSeats: "1",
  farePerPerson: "",
  estimatedTotalFare: "",
  notes: "",
};

const inputBaseClasses =
  "mt-2 w-full rounded-lg border bg-ruin-background px-4 py-3 text-ruin-text outline-none focus:border-ruin-orange";

function formatFare(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "0";
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}

function todayValue() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function toDateTimeParts(value) {
  if (!value) {
    return { date: "", time: "" };
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { date: "", time: "" };
  }

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  const [datePart, timePart] = local.toISOString().slice(0, 16).split("T");
  return { date: datePart, time: timePart };
}

function buildForm(initialData) {
  if (!initialData) {
    return initialForm;
  }

  const departure = toDateTimeParts(initialData.departureTime);
  const isCoPassenger = initialData.vehicleType === "auto";
  const storedSeats = String(initialData.totalSeats ?? "1");
  const storedFare = initialData.farePerPerson ?? "";
  const estimatedTotalFare =
    isCoPassenger && storedFare !== ""
      ? String(Number(storedFare) * (Number(storedSeats) + 1))
      : "";

  return {
    rideMode: isCoPassenger ? "coPassenger" : "offer",
    vehicleType: isCoPassenger ? "auto" : initialData.vehicleType || "bike",
    fromLocation: initialData.fromLocation || "",
    toLocation: initialData.toLocation || "",
    departureDate: departure.date,
    departureTime: departure.time,
    totalSeats: storedSeats,
    farePerPerson: isCoPassenger ? "" : storedFare,
    estimatedTotalFare,
    notes: initialData.notes || "",
  };
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs font-medium text-ruin-magenta">{message}</p>;
}

function Chip({ active, disabled = false, children, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-full border px-4 py-2 font-heading text-xs font-semibold tracking-[0.04em] transition ${
        active
          ? "border-ruin-orange bg-ruin-orange text-ruin-background"
          : "border-ruin-border bg-transparent text-ruin-muted hover:text-ruin-text"
      } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
    >
      {children}
    </button>
  );
}

export default function PostRideModal({ open, onClose, onSubmit, initialData = null, mode = "create" }) {
  const [form, setForm] = useState(initialForm);
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { isAuthenticated } = useAuth();
  const isEditing = mode === "edit";
  const isCoPassengerMode = form.rideMode === "coPassenger";
  const splitFare =
    isCoPassengerMode && Number(form.estimatedTotalFare) > 0 && Number(form.totalSeats) > 0
      ? Number(form.estimatedTotalFare) / (Number(form.totalSeats) + 1)
      : 0;

  useEffect(() => {
    if (open) {
      setForm(buildForm(initialData));
      setError("");
      setFieldErrors({});
    }
  }, [open, initialData]);

  useEffect(() => {
    if (!open) return undefined;
    const handleEscape = (e) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open]);

  if (!open) return null;

  const clearFieldError = (field) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const updateField = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "vehicleType") {
        next.totalSeats = value === "bike" ? "1" : CAR_SEATS.includes(String(prev.totalSeats)) ? String(prev.totalSeats) : "1";
      }
      return next;
    });
    clearFieldError(field);
    if (field === "fromLocation" || field === "toLocation") {
      clearFieldError("locations");
    }
  };

  const setRideMode = (rideMode) => {
    setForm((prev) => ({
      ...prev,
      rideMode,
      vehicleType: rideMode === "coPassenger" ? "auto" : prev.vehicleType === "car" ? "car" : "bike",
      totalSeats: "1",
      farePerPerson: rideMode === "coPassenger" ? "" : prev.farePerPerson,
      estimatedTotalFare: rideMode === "coPassenger" ? prev.estimatedTotalFare : "",
    }));
    setFieldErrors({});
    setError("");
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setError("");
      setFieldErrors({});
      setForm(buildForm(initialData));
      onClose();
    }, 250);
  };

  const validateForm = () => {
    const nextErrors = {};
    const from = form.fromLocation.trim();
    const to = form.toLocation.trim();
    const fareValue = isCoPassengerMode ? Number(form.estimatedTotalFare) : Number(form.farePerPerson);
    const seats = Number(form.totalSeats);

    if (!from) nextErrors.fromLocation = "From location is required.";
    if (!to) nextErrors.toLocation = "To location is required.";
    if (from && to && from.toLowerCase() === to.toLowerCase()) {
      nextErrors.locations = "From and To cannot be the same.";
    }
    if (!form.departureDate) {
      nextErrors.departureDate = isCoPassengerMode ? "Date is required." : "Departure date is required.";
    } else if (form.departureDate < todayValue()) {
      nextErrors.departureDate = "Date cannot be in the past.";
    }
    if (!form.departureTime) {
      nextErrors.departureTime = isCoPassengerMode ? "Approximate time is required." : "Departure time is required.";
    }

    if (isCoPassengerMode) {
      if (!AUTO_SEATS.includes(String(form.totalSeats))) {
        nextErrors.totalSeats = "Choose 1 or 2 co-passengers.";
      }
      if (!form.estimatedTotalFare) {
        nextErrors.estimatedTotalFare = "Estimated total fare is required.";
      } else if (!Number.isFinite(fareValue) || fareValue <= 0) {
        nextErrors.estimatedTotalFare = "Fare must be greater than Rs 0.";
      }
    } else {
      if (!OFFER_VEHICLES.includes(form.vehicleType)) {
        nextErrors.vehicleType = "Choose bike or car.";
      }
      if (form.vehicleType === "bike" && seats !== 1) {
        nextErrors.totalSeats = "Bike rides can offer only 1 pillion seat.";
      }
      if (form.vehicleType === "car" && !CAR_SEATS.includes(String(form.totalSeats))) {
        nextErrors.totalSeats = "Choose 1, 2, or 3 seats.";
      }
      if (!form.farePerPerson) {
        nextErrors.farePerPerson = "Fare per person is required.";
      } else if (!Number.isFinite(fareValue) || fareValue <= 0) {
        nextErrors.farePerPerson = "Fare must be greater than Rs 0.";
      }
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError("You must be logged in to offer a ride");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError("");

    const { departureDate, departureTime, rideMode, estimatedTotalFare, ...rideFields } = form;
    const seats = parseInt(form.totalSeats, 10);
    const fare = isCoPassengerMode
      ? Number(form.estimatedTotalFare) / (seats + 1)
      : Number(form.farePerPerson);
    const formattedData = {
      ...rideFields,
      vehicleType: isCoPassengerMode ? "auto" : form.vehicleType,
      fromLocation: form.fromLocation.trim(),
      toLocation: form.toLocation.trim(),
      departureTime: `${departureDate}T${departureTime}`,
      totalSeats: seats,
      farePerPerson: fare,
    };

    const result = await onSubmit(formattedData);
    if (result && result.success) {
      closeModal();
    } else {
      setError(result?.message || `Failed to ${isEditing ? "update" : "post"} ride`);
    }

    setIsLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && closeModal()}
    >
      <form
        noValidate
        className={`w-full max-w-[520px] max-h-[90vh] overflow-y-auto rounded-2xl border border-ruin-border bg-ruin-card p-6 sm:p-8 ${
          isClosing ? "modal-exit" : "modal-enter"
        }`}
        onSubmit={handleSubmit}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-bold text-ruin-text">{isEditing ? "Edit Ride" : "Offer a Ride"}</h2>
            <p className="mt-1 text-sm text-ruin-muted">{isEditing ? "Update your ride details." : "Share your commute and split costs."}</p>
          </div>
          <Button variant="ghost" className="-mr-2 -mt-2" onClick={closeModal} aria-label="Close modal">
            Close
          </Button>
        </div>

        {error && (
          <div className="mb-4 rounded bg-ruin-magenta/10 p-3 text-sm text-ruin-magenta">{error}</div>
        )}

        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setRideMode("offer")}
            className={`rounded-full border px-4 py-3 text-left transition ${
              !isCoPassengerMode
                ? "border-ruin-orange bg-ruin-orange text-ruin-background"
                : "border-ruin-border bg-transparent text-ruin-muted hover:text-ruin-text"
            }`}
          >
            <span className="block font-heading text-sm font-bold">🛵 Offering a Ride</span>
            <span className="mt-1 block text-xs leading-snug opacity-90">I'm going somewhere on my bike/car and can take someone</span>
          </button>
          <button
            type="button"
            onClick={() => setRideMode("coPassenger")}
            className={`rounded-full border px-4 py-3 text-left transition ${
              isCoPassengerMode
                ? "border-ruin-orange bg-ruin-orange text-ruin-background"
                : "border-ruin-border bg-transparent text-ruin-muted hover:text-ruin-text"
            }`}
          >
            <span className="block font-heading text-sm font-bold">🛺 Looking for Co-passenger</span>
            <span className="mt-1 block text-xs leading-snug opacity-90">I'm taking an auto and want to split the cost</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-ruin-text">From Location</span>
              <input
                value={form.fromLocation}
                onChange={(e) => updateField("fromLocation", e.target.value)}
                className={`${inputBaseClasses} ${fieldErrors.fromLocation || fieldErrors.locations ? "border-ruin-magenta" : "border-ruin-border"}`}
                placeholder="MIT Campus"
              />
              <FieldError message={fieldErrors.fromLocation || fieldErrors.locations} />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-ruin-text">To Location</span>
              <input
                value={form.toLocation}
                onChange={(e) => updateField("toLocation", e.target.value)}
                className={`${inputBaseClasses} ${fieldErrors.toLocation || fieldErrors.locations ? "border-ruin-magenta" : "border-ruin-border"}`}
                placeholder="Pune Station"
              />
              <FieldError message={fieldErrors.toLocation} />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <DatePickerField
                label={isCoPassengerMode ? "Date" : "Departure Date"}
                value={form.departureDate}
                onChange={(value) => updateField("departureDate", value)}
              />
              <FieldError message={fieldErrors.departureDate} />
            </div>
            <div>
              <TimePickerField
                label={isCoPassengerMode ? "Approximate Time" : "Departure Time"}
                value={form.departureTime}
                align="right"
                onChange={(value) => updateField("departureTime", value)}
              />
              <FieldError message={fieldErrors.departureTime} />
            </div>
          </div>

          {!isCoPassengerMode ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <span className="text-sm font-medium text-ruin-text">Vehicle</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {OFFER_VEHICLES.map((vehicle) => (
                      <Chip
                        key={vehicle}
                        active={form.vehicleType === vehicle}
                        onClick={() => updateField("vehicleType", vehicle)}
                      >
                        {vehicle === "bike" ? "Bike" : "Car"}
                      </Chip>
                    ))}
                  </div>
                  <FieldError message={fieldErrors.vehicleType} />
                </div>

                <div>
                  <span className="text-sm font-medium text-ruin-text">Seats</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(form.vehicleType === "bike" ? ["1"] : CAR_SEATS).map((seat) => (
                      <Chip
                        key={seat}
                        active={form.totalSeats === seat}
                        disabled={form.vehicleType === "bike"}
                        onClick={() => updateField("totalSeats", seat)}
                      >
                        {seat}
                      </Chip>
                    ))}
                  </div>
                  <FieldError message={fieldErrors.totalSeats} />
                </div>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-ruin-text">Fare per person in {"\u20B9"}</span>
                <input
                  type="number"
                  min="1"
                  value={form.farePerPerson}
                  onChange={(e) => updateField("farePerPerson", e.target.value)}
                  className={`${inputBaseClasses} ${fieldErrors.farePerPerson ? "border-ruin-magenta" : "border-ruin-border"}`}
                  placeholder="100"
                />
                <FieldError message={fieldErrors.farePerPerson} />
              </label>
            </>
          ) : (
            <>
              <div>
                <span className="text-sm font-medium text-ruin-text">Total Seats Needed</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {AUTO_SEATS.map((seat) => (
                    <Chip
                      key={seat}
                      active={form.totalSeats === seat}
                      onClick={() => updateField("totalSeats", seat)}
                    >
                      {seat}
                    </Chip>
                  ))}
                </div>
                <FieldError message={fieldErrors.totalSeats} />
              </div>

              <label className="block">
                <span className="text-sm font-medium text-ruin-text">Estimated Total Fare in {"\u20B9"}</span>
                <input
                  type="number"
                  min="1"
                  value={form.estimatedTotalFare}
                  onChange={(e) => updateField("estimatedTotalFare", e.target.value)}
                  className={`${inputBaseClasses} ${fieldErrors.estimatedTotalFare ? "border-ruin-magenta" : "border-ruin-border"}`}
                  placeholder="180"
                />
                <FieldError message={fieldErrors.estimatedTotalFare} />
                <p className="mt-1.5 text-xs font-medium text-[#00C9A7]">
                  Each person pays {"\u20B9"}{formatFare(splitFare)}
                </p>
              </label>
            </>
          )}

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
          {isLoading
            ? isEditing
              ? "Saving..."
              : "Posting..."
            : isEditing
              ? "Save Changes"
              : isCoPassengerMode
                ? "Find Co-passenger"
                : "Offer Ride"}
        </Button>
      </form>
    </div>
  );
}
