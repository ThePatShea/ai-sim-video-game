import { ChatMessage } from "window.ai";

interface Character {
  id: number;
  name: string;
  age: number;
  gender: string;
  personality: string;
  backstory: string;
  appearance: string;
  messages: ChatMessage[];
  dating: boolean;
  scores: {
    friendship: number;
    romance: number;
  };
}

export default Character;
