const DEFAULT_RUBRIC = [
  { criterion: "Requirement Understanding", maxScore: 15 },
  { criterion: "Class Responsibilities", maxScore: 20 },
  { criterion: "Encapsulation", maxScore: 15 },
  { criterion: "Coupling & Cohesion", maxScore: 15 },
  { criterion: "Abstraction / Interfaces", maxScore: 10 },
  { criterion: "Extensibility", maxScore: 10 },
  { criterion: "Edge Cases", maxScore: 10 },
  { criterion: "Explanation Quality", maxScore: 5 },
];

const RUBRIC_TOTAL = DEFAULT_RUBRIC.reduce((sum, c) => sum + c.maxScore, 0); // 100

module.exports = { DEFAULT_RUBRIC, RUBRIC_TOTAL };
