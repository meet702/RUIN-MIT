import { FILTER_CATEGORIES } from "../../data/mockGigs";
import Tag from "../ui/Tag";

export default function GigFilters({ selectedCategory, onSelectCategory }) {
  return (
    <div className="-mx-4 mt-10 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div className="flex snap-x snap-mandatory gap-3 pb-2">
        {FILTER_CATEGORIES.map((category, index) => (
          <Tag
            key={category}
            active={selectedCategory === category}
            className="chip-enter"
            style={{ animationDelay: `${index * 40}ms` }}
            onClick={() => onSelectCategory(category)}
          >
            {category}
          </Tag>
        ))}
      </div>
    </div>
  );
}
