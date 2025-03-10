import FriendshipLevel from "../types/friendshipLevel";
import RomanceLevel from "../types/RomanceLevel";

interface FriendshipUnlock {
  friendshipLevel: FriendshipLevel;
  amount: number;
}

interface RomanceUnlock {
  romanceLevel: RomanceLevel;
  amount: number;
}

interface SkillUnlock {
  name: string;
  level: number;
}

interface Unlock {
  friendship?: FriendshipUnlock[];
  romance?: RomanceUnlock[];
  skills?: SkillUnlock[];
}

interface Location {
  id: number;
  name: string;
  description: string;
  image: string;
  music: string;
  characters: number[];
  skillId: number;
  locked: boolean;
  unlock?: Unlock;
}

export default Location;
