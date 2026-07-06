import Tag from "../ui/Tag";
import FilterPillGroup from "../ui/FilterPillGroup";

const STATUSES = ["open", "in_progress"];

export default function GigFilters({ selectedStatus, onSelectStatus }) {
  return (
    <FilterPillGroup>
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
    </FilterPillGroup>
  );
}
