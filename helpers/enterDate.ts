import { ChatMessage } from "window.ai";

import Character from "../interfaces/character";

const enterDate = (
  activeCharacterId: number | null,
  setCharacters: (characters: Character[]) => void,
  setCharacterExpression: (expression: string) => void,
  setDisplayMessage: (message: ChatMessage) => void,
  setInputValue: (value: string) => void,
  setDateStatus: (status: string) => void,
  characters: Character[]
) => {
  if (activeCharacterId === null) return;

  let updatedCharacters = [...characters];
  updatedCharacters[activeCharacterId].dating = true;
  setCharacters(updatedCharacters);

  setCharacterExpression("joyful");
  setDateStatus("active");
  setDisplayMessage({ role: "assistant", content: "" });
  setInputValue("");
};

export default enterDate;
