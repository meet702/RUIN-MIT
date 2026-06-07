export const FILTER_CATEGORIES = [
  "All",
  "Assignments",
  "Projects",
  "Design",
  "Coding",
  "Lab Files",
  "Other",
];

export const GIG_CATEGORIES = FILTER_CATEGORIES.filter((category) => category !== "All");

export const CATEGORY_ACCENTS = {
  Assignments: "#FF2D6F",
  Coding: "#FFE11A",
  Design: "#F26522",
  Projects: "#00C9A7",
  "Lab Files": "#A78BFA",
  Other: "#F0EDE6",
};

export const mockGigs = [
  {
    id: 1,
    title: "DBMS assignment 4 pages due tomorrow, please make it look handwritten",
    category: "Assignments",
    budget: 150,
    deadline: "Due in 1 day",
    postedBy: {
      name: "Rohan M.",
      branch: "CSE",
      year: "3rd Year",
    },
  },
  {
    id: 2,
    title: "SolidWorks 3D model for mech submission, basic assembly but clean",
    category: "Projects",
    budget: 350,
    deadline: "Due in 3 days",
    postedBy: {
      name: "Aditi K.",
      branch: "Mech",
      year: "2nd Year",
    },
  },
  {
    id: 3,
    title: "Minor project PPT before 9am",
    category: "Design",
    budget: 200,
    deadline: "Due tomorrow",
    postedBy: {
      name: "Samar P.",
      branch: "MBA",
      year: "1st Year",
    },
  },
  {
    id: 4,
    title: "Fix my React login page, button click is doing absolutely nothing",
    category: "Coding",
    budget: 500,
    deadline: "Due in 2 days",
    postedBy: {
      name: "Ira N.",
      branch: "CSE",
      year: "2nd Year",
    },
  },
  {
    id: 5,
    title: "CN lab file 6 experiments, diagrams and observation tables needed",
    category: "Lab Files",
    budget: 180,
    deadline: "Due in 2 days",
    postedBy: {
      name: "Pranav S.",
      branch: "ENTC",
      year: "3rd Year",
    },
  },
  {
    id: 6,
    title: "Club event poster needed tonight",
    category: "Design",
    budget: 120,
    deadline: "Due tonight",
    postedBy: {
      name: "Niyati R.",
      branch: "Media",
      year: "2nd Year",
    },
  },
  {
    id: 7,
    title: "Write short reflection for peace studies elective, 600 words only",
    category: "Assignments",
    budget: 80,
    deadline: "Due in 4 hours",
    postedBy: {
      name: "Vedant C.",
      branch: "CSE",
      year: "1st Year",
    },
  },
  {
    id: 8,
    title: "Arduino code for sensor reading demo in ENTC lab, simple serial output",
    category: "Coding",
    budget: 300,
    deadline: "Due in 5 days",
    postedBy: {
      name: "Meera J.",
      branch: "ENTC",
      year: "2nd Year",
    },
  },
  {
    id: 9,
    title: "Print and spiral bind notes near campus",
    category: "Other",
    budget: 100,
    deadline: "Due tomorrow",
    postedBy: {
      name: "Kabir A.",
      branch: "MBA",
      year: "1st Year",
    },
  },
];
