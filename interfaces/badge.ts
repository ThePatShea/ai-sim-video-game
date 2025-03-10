import FriendshipLevel from "../types/friendshipLevel";
import RomanceLevel from "../types/RomanceLevel";

interface Badge {
  id: number;
  name: string;
  description: string;
  type: string;
  friendshipLevel?: FriendshipLevel;
  romanceLevel?: RomanceLevel;
  skillName?: string;
  amount: number;
  attained: boolean;
}

export default Badge;
