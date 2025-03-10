import friendshipThresholds from "../helpers/friendshipThresholds.json";
import FriendshipLevel from "../types/friendshipLevel";

const getFriendshipLevel = (friendshipScore: number): FriendshipLevel => {
  if (friendshipScore >= friendshipThresholds["BFF"]) {
    return "BFF";
  } else if (friendshipScore >= friendshipThresholds["Best Friend"]) {
    return "Best Friend";
  } else if (friendshipScore >= friendshipThresholds["Inseparable"]) {
    return "Inseparable";
  } else if (friendshipScore >= friendshipThresholds["Close Friend"]) {
    return "Close Friend";
  } else if (friendshipScore >= friendshipThresholds["Great Friend"]) {
    return "Great Friend";
  } else if (friendshipScore >= friendshipThresholds["Good Friend"]) {
    return "Good Friend";
  } else if (friendshipScore >= friendshipThresholds["Friend"]) {
    return "Friend";
  } else if (friendshipScore >= friendshipThresholds["Buddy"]) {
    return "Buddy";
  } else if (friendshipScore >= friendshipThresholds["Pal"]) {
    return "Pal";
  } else if (friendshipScore >= friendshipThresholds["Acquaintance"]) {
    return "Acquaintance";
  } else if (friendshipScore > friendshipThresholds["Rival"]) {
    return "Opponent";
  } else if (friendshipScore > friendshipThresholds["Foe"]) {
    return "Rival";
  } else if (friendshipScore > friendshipThresholds["Adversary"]) {
    return "Foe";
  } else if (friendshipScore > friendshipThresholds["Antagonist"]) {
    return "Adversary";
  } else if (friendshipScore > friendshipThresholds["Enemy"]) {
    return "Antagonist";
  } else if (friendshipScore > friendshipThresholds["Villain"]) {
    return "Enemy";
  } else if (friendshipScore > friendshipThresholds["Malefactor"]) {
    return "Villain";
  } else if (friendshipScore > friendshipThresholds["Nemesis"]) {
    return "Malefactor";
  } else if (friendshipScore > friendshipThresholds["Arch Nemesis"]) {
    return "Nemesis";
  } else {
    return "Arch Nemesis";
  }
};

export default getFriendshipLevel;
