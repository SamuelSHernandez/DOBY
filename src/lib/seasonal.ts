export interface SeasonalNote {
  label: string;
  title: string;
  description: string;
}

export function getSeasonalNote(): SeasonalNote {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) {
    return {
      label: "Seasonal",
      title: "Spring maintenance window",
      description: "Gutter cleaning, exterior inspection, and AC pre-season check before May.",
    };
  }
  if (month >= 5 && month <= 7) {
    return {
      label: "Seasonal",
      title: "Summer maintenance window",
      description: "Check irrigation, trim trees, inspect deck/patio, and service dryer vent.",
    };
  }
  if (month >= 8 && month <= 10) {
    return {
      label: "Seasonal",
      title: "Fall maintenance window",
      description: "Furnace service, gutter cleaning, weatherization, and drain outdoor faucets.",
    };
  }
  return {
    label: "Seasonal",
    title: "Winter maintenance window",
    description: "Check for ice dams, inspect insulation, test backup generator, and plan spring projects.",
  };
}
