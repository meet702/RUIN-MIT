import { useCallback, useState } from "react";
import { mockGigs } from "../data/mockGigs";

function formatDeadline(dateValue) {
  if (!dateValue) {
    return "Flexible";
  }

  const today = new Date();
  const deadline = new Date(`${dateValue}T23:59:59`);
  const diffMs = deadline.getTime() - today.getTime();
  const days = Math.ceil(diffMs / 86400000);

  if (days <= 0) {
    return "Due today";
  }

  if (days === 1) {
    return "Due tomorrow";
  }

  return `Due in ${days} days`;
}

function filterGigs(gigs, category) {
  return category === "All" ? gigs : gigs.filter((gig) => gig.category === category);
}

export function useGigs() {
  const [gigs, setGigs] = useState(mockGigs);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [visibleGigs, setVisibleGigs] = useState(mockGigs);
  const [isExiting, setIsExiting] = useState(false);

  const selectCategory = useCallback(
    (category) => {
      if (category === selectedCategory) {
        return;
      }

      setSelectedCategory(category);
      setIsExiting(true);

      window.setTimeout(() => {
        setVisibleGigs(filterGigs(gigs, category));
        setIsExiting(false);
      }, 150);
    },
    [gigs, selectedCategory]
  );

  const addGig = useCallback(
    (gig) => {
      const nextGig = {
        id: Date.now(),
        title: gig.title,
        category: gig.category,
        budget: Number(gig.budget),
        deadline: formatDeadline(gig.deadline),
        description: gig.description,
        postedBy: {
          name: "You",
          branch: "MIT-WPU",
          year: "Student",
        },
      };

      setGigs((currentGigs) => [nextGig, ...currentGigs]);
      setVisibleGigs((currentVisibleGigs) => {
        if (selectedCategory !== "All" && nextGig.category !== selectedCategory) {
          return currentVisibleGigs;
        }

        return [nextGig, ...currentVisibleGigs];
      });
    },
    [selectedCategory]
  );

  return {
    gigs: visibleGigs,
    selectedCategory,
    selectCategory,
    addGig,
    isExiting,
  };
}
