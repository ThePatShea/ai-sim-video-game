import Character from "../interfaces/character";

const setRomanceScore = (
  newScore: number,
  setCharacters: (characters: Character[]) => void,
  activeCharacterId: number | null,
  characters: Character[]
) => {
  if (activeCharacterId === null) return;

  let updatedCharacters = [...characters];

  updatedCharacters[activeCharacterId].scores.romance = newScore;

  setCharacters(updatedCharacters);
};

export default setRomanceScore;
