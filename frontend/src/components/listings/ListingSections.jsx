import { isOwnPost } from "../../utils/ownership";

function SectionHeading({ children }) {
  return (
    <h2 className="font-heading text-sm font-bold text-ruin-text">
      {children}
    </h2>
  );
}

function ListingGrid({ children, className = "", topMargin = "mt-4" }) {
  const gridClassName = className || "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";

  return (
    <div className={`${topMargin} grid ${gridClassName}`}>
      {children}
    </div>
  );
}

export default function ListingSections({
  items,
  currentUserId,
  renderCard,
  gridClassName = "",
}) {
  const yourPosts = [];
  const otherPosts = [];

  items.forEach((item) => {
    if (isOwnPost(item, currentUserId)) {
      yourPosts.push(item);
    } else {
      otherPosts.push(item);
    }
  });

  if (yourPosts.length === 0) {
    return (
      <ListingGrid className={gridClassName} topMargin="mt-8">
        {items.map((item, index) => renderCard(item, index, false))}
      </ListingGrid>
    );
  }

  return (
    <div className="mt-8 space-y-8">
      <section>
        <SectionHeading>Your Posts</SectionHeading>
        <ListingGrid className={gridClassName}>
          {yourPosts.map((item, index) => renderCard(item, index, true))}
        </ListingGrid>
      </section>

      {otherPosts.length > 0 && (
        <section>
          <SectionHeading>From Others</SectionHeading>
          <ListingGrid className={gridClassName}>
            {otherPosts.map((item, index) => renderCard(item, index, false))}
          </ListingGrid>
        </section>
      )}
    </div>
  );
}
