import Character from "../interfaces/character";

const updateRomanceScore = (
  multiplier: number,
  activeCharacterId: number | null,
  setRomanceScoreChange: (change: number) => void,
  setCharacters: (characters: Character[]) => void,
  characters: Character[]
) => {
  if (activeCharacterId === null) return;

  let updatedCharacters = [...characters];

  let scoreChange =
    (Math.floor(Math.random() * 4) + 1) * multiplier * 2 +
    (Math.floor(Math.random() * 5) + 1);

  updatedCharacters[activeCharacterId].scores.romance += scoreChange;

  if (updatedCharacters[activeCharacterId].scores.romance < 0) {
    updatedCharacters[activeCharacterId].scores.romance = 0;
  }

  setRomanceScoreChange(scoreChange);
  setCharacters(updatedCharacters);
};

export default updateRomanceScore;
