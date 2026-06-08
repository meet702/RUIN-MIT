import Tag from "../ui/Tag";

const STATUSES = ["open", "in_progress"];

export default function GigFilters({ selectedStatus, onSelectStatus }) {
  return (
    <div className="-mx-4 mt-10 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div className="flex snap-x snap-mandatory gap-3 pb-2">
        {STATUSES.map((status, index) => (
          <Tag
            key={status}
            active={selectedStatus === status}
            className="chip-enter capitalize"
            style={{ animationDelay: `${index * 40}ms` }}
            onClick={() => onSelectStatus(status)}
          >
            {status === "in_progress" ? "assigned" : status}
          </Tag>
        ))}
      </div>
    </div>
  );
}
