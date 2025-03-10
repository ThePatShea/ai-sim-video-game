import { useRef } from "react";
import baseLocations from "./baseLocations.json";
import menus from "./menus.json";

const getSoundRef = () => {
  const soundRef = {
    menus: {
      map: {
        sound: menus.map.music,
        ref: useRef<HTMLAudioElement | null>(null),
      },
      date: {
        sound: menus.date.music,
        ref: useRef<HTMLAudioElement | null>(null),
      },
    },
    interactions: {
      success: {
        sound: "/sounds/interactions/success.mp3",
        ref: useRef<HTMLAudioElement | null>(null),
      },
      failure: {
        sound: "/sounds/interactions/failure.mp3",
        ref: useRef<HTMLAudioElement | null>(null),
      },
    },
    locations: [
      {
        sound: baseLocations[0].music,
        ref: useRef<HTMLAudioElement | null>(null),
      },
      {
        sound: baseLocations[1].music,
        ref: useRef<HTMLAudioElement | null>(null),
      },
      {
        sound: baseLocations[2].music,
        ref: useRef<HTMLAudioElement | null>(null),
      },
      {
        sound: baseLocations[3].music,
        ref: useRef<HTMLAudioElement | null>(null),
      },
      {
        sound: baseLocations[4].music,
        ref: useRef<HTMLAudioElement | null>(null),
      },
      {
        sound: baseLocations[5].music,
        ref: useRef<HTMLAudioElement | null>(null),
      },
    ],
  };

  return soundRef;
};

export default getSoundRef;
