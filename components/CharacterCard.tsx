import Image from "next/image";
import React, { useState, useEffect } from "react";
import Character from "../interfaces/character";

interface CharacterCardProps {
  characters: { [id: number]: Character };
  characterId: number;
  setActiveCharacterId: (id: number | null) => void;
  setInputValue: (value: string) => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({
  characters,
  characterId,
  setActiveCharacterId,
  setInputValue,
}) => {
  const characterCardImages = [
    "joyful",
    "angry",
    "content",
    "sad",
    "amused",
    "shocked",
    "excited",
    "embarrassed",
    "flirtatious",
    "distressed",
  ];
  const startingNumber: number = Math.floor(
    Math.random() * characterCardImages.length
  );

  const [currentCharacterCardImage, setCurrentCharacterImage] =
    useState<number>(startingNumber);

  const selectCharacter = (characterId: number) => {
    setActiveCharacterId(characterId);
    setInputValue("");
  };

  useEffect(() => {
    setTimeout(() => {
      const updatedCharacterCardImage =
        currentCharacterCardImage !== characterCardImages.length - 1
          ? currentCharacterCardImage + 1
          : 0;
      setCurrentCharacterImage(updatedCharacterCardImage);
    }, 1000);
  }, [currentCharacterCardImage]);

  return (
    <button
      className="relative bg-indigo-200 hover:bg-indigo-100 bg-opacity-90 hover:bg-opacity-80 mx-8 rounded-lg border-2 border-indigo-950 overflow-hidden shadow-lg active:shadow-none"
      style={{
        width: 400,
        height: 400,
      }}
      onClick={() => selectCharacter(characterId)}
    >
      <Image
        src={`/images/characters/${characterId}/${characterCardImages[currentCharacterCardImage]}.png`}
        width={4096}
        height={4096}
        alt="Character"
        className="absolute top-0"
        style={{
          height: "100%",
          width: "100%",
          pointerEvents: "none",
        }}
      />
      <div className="absolute bottom-0 w-full text-center font-light bg-indigo-950 border-t-2 border-indigo-950 bg-opacity-70 pt-1 pb-2">
        <div className="text-3xl text-white" style={{ lineHeight: "100%" }}>
          {characters[characterId].name}
        </div>
        <div className="text-lg text-indigo-200" style={{ lineHeight: "100%" }}>
          Age {characters[characterId].age}
        </div>
      </div>
    </button>
  );
};

export default CharacterCard;
