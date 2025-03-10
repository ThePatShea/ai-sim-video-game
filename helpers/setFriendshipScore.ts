import Character from "../interfaces/character";

const setFriendshipScore = (
  newScore: number,
  setCharacters: (characters: Character[]) => void,
  activeCharacterId: number | null,
  characters: Character[]
) => {
  if (activeCharacterId === null) return;

  let updatedCharacters = [...characters];

  updatedCharacters[activeCharacterId].scores.friendship = newScore;

  setCharacters(updatedCharacters);
};

export default setFriendshipScore;
