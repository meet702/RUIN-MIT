import GigCard from "./GigCard";

export default function GigGrid({ gigs, isExiting }) {
  return (
    <section
      className={`mt-8 grid grid-cols-1 items-start gap-5 md:grid-cols-2 xl:grid-cols-3 ${
        isExiting ? "gig-grid-exit" : ""
      }`}
    >
      {gigs.map((gig, index) => (
        <GigCard key={gig.id} gig={gig} index={index} />
      ))}
    </section>
  );
}
