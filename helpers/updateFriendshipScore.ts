import triggerScoreChangeAnimation from "./triggerScoreChangeAnimation";

import Character from "../interfaces/character";

const updateFriendshipScore = (
  multiplier: number,
  activeCharacterId: number | null,
  setFriendshipScoreChange: (change: number) => void,
  setCharacters: (characters: Character[]) => void,
  setScoreChangeAnimating: (animating: boolean) => void,
  characters: Character[],
  soundRef: any
) => {
  if (activeCharacterId === null) return;

  let updatedCharacters = [...characters];

  let scoreChange =
    (Math.floor(Math.random() * 4) + 1) * multiplier * 2 +
    (Math.floor(Math.random() * 9) + 1);

  updatedCharacters[activeCharacterId].scores.friendship += scoreChange;

  setFriendshipScoreChange(scoreChange);
  setCharacters(updatedCharacters);
  triggerScoreChangeAnimation(setScoreChangeAnimating);

  if (multiplier > 0) {
    if (soundRef.interactions.success.ref.current) {
      soundRef.interactions.success.ref.current.play();
    }
  } else if (multiplier < 0) {
    if (soundRef.interactions.failure.ref.current) {
      soundRef.interactions.failure.ref.current.play();
    }
  }
};

export default updateFriendshipScore;
