import { ChatMessage } from "window.ai";

import Character from "../interfaces/character";
import Location from "../interfaces/location";

import enterDate from "./enterDate";

const selectLocation = (
  locationId: number,
  setActiveLocation: (location: Location) => void,
  setInputValue: (value: string) => void,
  setActiveView: (view: string) => void,
  dateStatus: string,
  activeCharacterId: number | null,
  activeLocation: Location,
  setCharacters: (characters: Character[]) => void,
  setCharacterExpression: (expression: string) => void,
  setDisplayMessage: (message: ChatMessage) => void,
  setDateStatus: (status: string) => void,
  characters: Character[],
  locations: Location[],
  soundRef: any
) => {
  const updatedLocation =
    locations.find((location) => location.id === locationId) ?? locations[0];

  if (updatedLocation.locked) {
    return;
  }

  const locationSoundRef = soundRef.locations[activeLocation.id].ref;

  if (locationSoundRef.current) {
    locationSoundRef.current.pause();
    locationSoundRef.current.currentTime = 0;
  }

  if (soundRef.menus.date.ref.current) {
    soundRef.menus.date.ref.current.pause();
    soundRef.menus.date.ref.current.currentTime = 0;
  }

  if (soundRef.menus.map.ref.current) {
    soundRef.menus.map.ref.current.pause();
    soundRef.menus.map.ref.current.currentTime = 0;
  }

  soundRef.locations[locationId].ref.current?.play();

  setActiveLocation(updatedLocation);
  setActiveView("location");
  setInputValue("");

  if (dateStatus === "starting") {
    enterDate(
      activeCharacterId,
      setCharacters,
      setCharacterExpression,
      setDisplayMessage,
      setInputValue,
      setDateStatus,
      characters
    );
  }
};

export default selectLocation;
