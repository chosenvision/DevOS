/**
 * Starter course templates based on well-known, free, publicly available
 * online courses/curricula. These are representative outlines, not a
 * live-scraped or guaranteed-current syllabus — course platforms
 * reorganize their curricula over time and this session has no way to
 * fetch their current state. Each template links to the real course so
 * users can check the actual current structure; lessons are fully
 * editable/deletable after adding, same as any other course.
 */

export interface CourseTemplate {
  id: string;
  name: string;
  platform: string;
  url: string;
  description: string;
  lessons: string[];
}

export const COURSE_TEMPLATES: CourseTemplate[] = [
  {
    id: "cs50x",
    name: "CS50x: Introduction to Computer Science",
    platform: "Harvard University (edX)",
    url: "https://cs50.harvard.edu/x/",
    description: "Harvard's famous, free intro to CS — C, Python, SQL, web development, and problem sets throughout.",
    lessons: [
      "Scratch (visual programming intro)",
      "C: syntax, compiling, debugging",
      "Arrays & algorithms (searching, sorting)",
      "Memory management & pointers",
      "Data structures (linked lists, trees, hash tables)",
      "Python",
      "SQL & databases",
      "HTML, CSS & JavaScript",
      "Flask web development",
      "Final project",
    ],
  },
  {
    id: "odin-foundations",
    name: "The Odin Project: Foundations",
    platform: "The Odin Project",
    url: "https://www.theodinproject.com/paths/foundations",
    description: "Free, open-source foundations course — the on-ramp to their full-stack JavaScript path.",
    lessons: [
      "Prerequisites & dev environment setup",
      "HTML & CSS fundamentals",
      "JavaScript basics",
      "Git & version control",
      "CSS Flexbox & Grid",
      "Foundations course project",
    ],
  },
  {
    id: "fcc-responsive-web-design",
    name: "Responsive Web Design",
    platform: "freeCodeCamp",
    url: "https://www.freecodecamp.org/learn/",
    description: "Free certification covering HTML, CSS, and responsive layout fundamentals.",
    lessons: [
      "HTML fundamentals",
      "CSS fundamentals",
      "Responsive design principles",
      "CSS Flexbox",
      "CSS Grid",
      "Accessibility basics",
      "Certification project",
    ],
  },
  {
    id: "fcc-js-algorithms",
    name: "JavaScript Algorithms and Data Structures",
    platform: "freeCodeCamp",
    url: "https://www.freecodecamp.org/learn/",
    description: "Free certification covering core JavaScript, ES6+, data structures, and algorithmic thinking.",
    lessons: [
      "JavaScript basics",
      "ES6+ syntax",
      "Regular expressions",
      "Debugging",
      "Basic data structures (arrays, objects)",
      "Algorithm scripting practice",
      "Object-oriented programming",
      "Functional programming",
      "Certification project",
    ],
  },
  {
    id: "python-fundamentals",
    name: "Python Fundamentals",
    platform: "Python.org official tutorial",
    url: "https://docs.python.org/3/tutorial/",
    description: "A ground-up path through core Python using the language's own official tutorial as reference.",
    lessons: [
      "Syntax & data types",
      "Control flow (if/else, loops)",
      "Functions",
      "Data structures (lists, dicts, sets)",
      "File I/O",
      "Modules & packages",
      "Practice project",
    ],
  },
  {
    id: "sql-fundamentals",
    name: "SQL Fundamentals",
    platform: "W3Schools SQL Tutorial",
    url: "https://www.w3schools.com/sql/",
    description: "A practical path through SQL — querying, joins, and schema design — using a widely-used free reference.",
    lessons: [
      "SELECT, WHERE, ORDER BY",
      "JOINs",
      "Aggregate functions & GROUP BY",
      "Subqueries",
      "INSERT / UPDATE / DELETE",
      "Creating tables & constraints",
      "Practice project",
    ],
  },
];
