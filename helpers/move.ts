import { ChatMessage } from "window.ai";

import Location from "../interfaces/location";

const leaveConversation = (
  setCharacterExpression: (expression: string) => void,
  setActiveCharacterId: (id: number | null) => void,
  setDateStatus: (status: string) => void,
  setDisplayMessage: (message: ChatMessage) => void,
  setInputValue: (value: string) => void
) => {
  setCharacterExpression("expressionless");
  setActiveCharacterId(null);
  setDateStatus("none");
  setDisplayMessage({ role: "assistant", content: "" });
  setInputValue("");
};

const goToMap = (
  setActiveView: (view: string) => void,
  setCharacterExpression: (expression: string) => void,
  setActiveCharacterId: (id: number | null) => void,
  setDateStatus: (status: string) => void,
  setDisplayMessage: (message: ChatMessage) => void,
  setInputValue: (value: string) => void,
  activeLocation: Location,
  soundRef: any
) => {
  const locationSoundRef = soundRef.locations[activeLocation.id].ref;

  if (locationSoundRef.current) {
    locationSoundRef.current.pause();
    locationSoundRef.current.currentTime = 0;
  }

  soundRef.menus.map.ref.current?.play();

  setActiveView("map");
  setDateStatus("none");
  leaveConversation(
    setCharacterExpression,
    setActiveCharacterId,
    setDateStatus,
    setDisplayMessage,
    setInputValue
  );
  setInputValue("");
};

const startGame = (
  setActiveView: (view: string) => void,
  setCharacterExpression: (expression: string) => void,
  setActiveCharacterId: (id: number | null) => void,
  setDateStatus: (status: string) => void,
  setDisplayMessage: (message: ChatMessage) => void,
  setInputValue: (value: string) => void,
  activeLocation: Location,
  soundRef: any
) => {
  goToMap(
    setActiveView,
    setCharacterExpression,
    setActiveCharacterId,
    setDateStatus,
    setDisplayMessage,
    setInputValue,
    activeLocation,
    soundRef
  );
};

export { leaveConversation, goToMap, startGame };
