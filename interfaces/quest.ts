import Objective from "./objective";

interface Quest {
  id: number;
  name: string;
  started: boolean;
  completed: boolean;
  objectives: Objective[];
}

export default Quest;
