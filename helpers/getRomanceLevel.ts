import romanceThresholds from "../helpers/romanceThresholds.json";
import RomanceLevel from "../types/RomanceLevel";

const getRomanceLevel = (romanceScore: number): RomanceLevel => {
  if (romanceScore >= romanceThresholds["Soulmate"]) {
    return "Soulmate";
  } else if (romanceScore >= romanceThresholds["In Love"]) {
    return "In Love";
  } else if (romanceScore >= romanceThresholds["Cherished"]) {
    return "Cherished";
  } else if (romanceScore >= romanceThresholds["Devoted"]) {
    return "Devoted";
  } else if (romanceScore >= romanceThresholds["Committed"]) {
    return "Committed";
  } else if (romanceScore >= romanceThresholds["Harmonious"]) {
    return "Harmonious";
  } else if (romanceScore >= romanceThresholds["Enamored"]) {
    return "Enamored";
  } else if (romanceScore >= romanceThresholds["Romantic"]) {
    return "Romantic";
  } else if (romanceScore >= romanceThresholds["Interested"]) {
    return "Interested";
  } else {
    return "Flirty";
  }
};

export default getRomanceLevel;
