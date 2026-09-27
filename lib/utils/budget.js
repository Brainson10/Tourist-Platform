/**
 * Rough trip cost in INR. Stay, food and local transport come from a per-person daily figure;
 * experiences use their listed price per person. Experiences without a price are counted, not guessed.
 */
export function estimateBudget({ days, travelers = 1, dailyBudget = 0, experiences = [] }) {
  const people = Math.max(1, Number(travelers) || 1);
  const perDay = Math.max(0, Number(dailyBudget) || 0);
  const priced = experiences.filter((experience) => experience.price !== null && experience.price !== undefined);
  const experiencesTotal = priced.reduce((sum, experience) => sum + Number(experience.price) * people, 0);
  const dailyTotal = perDay * Math.max(1, days) * people;

  return {
    days: Math.max(1, days),
    travelers: people,
    dailyBudget: perDay,
    dailyTotal,
    experiencesTotal,
    unpricedExperiences: experiences.length - priced.length,
    total: dailyTotal + experiencesTotal,
    perPerson: Math.round((dailyTotal + experiencesTotal) / people),
  };
}
