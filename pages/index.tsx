import { ChatMessage, WindowAI, getWindowAI } from "window.ai";
import React, { useState, useEffect, useRef } from "react";
import InstallationToast from "@/components/toast";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/router";
import Image from "next/image";

import {
  sendMessage,
  askOnDate,
  breakUp,
  cancelDate,
  finishDate,
} from "../helpers/message";
import { leaveConversation, goToMap, startGame } from "../helpers/move";
import friendshipThresholds from "../helpers/friendshipThresholds.json";
import romanceThresholds from "../helpers/romanceThresholds.json";
import getCharacterPrompt from "../prompts/getCharacterPrompt";
import getFriendshipLevel from "../helpers/getFriendshipLevel";
import thousandSeparator from "../helpers/thousandSeparator";
import getRomanceLevel from "../helpers/getRomanceLevel";
import selectLocation from "../helpers/selectLocation";
import expressions from "../helpers/expressions.json";
import baseQuests from "../helpers/baseQuests.json";
import getSoundRef from "../helpers/getSoundRef";
import startDate from "../helpers/startDate";
import menus from "../helpers/menus.json";

import CharacterCard from "../components/CharacterCard";
import BadgeCard from "../components/BadgeCard";
import ItemCard from "../components/ItemCard";

import Character from "../interfaces/character";
import Location from "../interfaces/location";
import Progress from "../interfaces/progress";
import Badge from "../interfaces/badge";
import Quest from "../interfaces/quest";
import Skill from "../interfaces/skill";
import Item from "../interfaces/item";

import baseCharacters from "../helpers/baseCharacters.json";
import baseLocations from "../helpers/baseLocations.json";
import baseProgress from "../helpers/baseProgress.json";
import baseBadges from "../helpers/baseBadges.json";
import baseSkills from "../helpers/baseSkills.json";
import baseItems from "../helpers/baseItems.json";

import FriendshipLevel from "../types/friendshipLevel";
import RomanceLevel from "../types/RomanceLevel";

const App: React.FC = () => {
  const [displayMessage, setDisplayMessage] = useState<ChatMessage>({
    role: "assistant",
    content: "",
  });
  const [activeLocation, setActiveLocation] = useState<Location>(
    baseLocations[0] as Location
  );
  const [characterExpression, setCharacterExpression] =
    useState<string>("expressionless");
  const [locations, setLocations] = useState<Location[]>(
    baseLocations as Location[]
  );
  const [scoreChangeAnimating, setScoreChangeAnimating] =
    useState<boolean>(false);
  const [activeCharacterId, setActiveCharacterId] = useState<number | null>(
    null
  );
  const [friendshipScoreChange, setFriendshipScoreChange] = useState<number>(0);
  const [activeStoreItem, setActiveStoreItem] = useState<Item | null>(null);
  const [characters, setCharacters] = useState<Character[]>(baseCharacters);
  const [romanceScoreChange, setRomanceScoreChange] = useState<number>(0);
  const [badges, setBadges] = useState<Badge[]>(baseBadges as Badge[]);
  const [currentMoney, setCurrentMoney] = useState<number>(10000);
  const [progress, setProgress] = useState<Progress>(baseProgress);
  const [activePopup, setActivePopup] = useState<string>("none");
  const [activeView, setActiveView] = useState<string>("start");
  const [dateStatus, setDateStatus] = useState<string>("none");
  const [skillChange, setSkillChange] = useState<number>(0);
  const [quests, setQuests] = useState<Quest[]>(baseQuests);
  const [skills, setSkills] = useState<Skill[]>(baseSkills);
  const [inputValue, setInputValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [items, setItems] = useState<Item[]>(baseItems);

  const aiRef = useRef<WindowAI | null>(null);
  const soundRef = getSoundRef();
  const router = useRouter();

  type InteractionsKey = keyof typeof soundRef.interactions;
  type MenuKey = keyof typeof soundRef.menus;

  const activeCharacter: Character | null =
    activeCharacterId !== null ? characters[activeCharacterId] : null;
  const latestMessage: ChatMessage | null = activeCharacter
    ? activeCharacter.messages[activeCharacter.messages.length - 1]
    : null;
  const characterPrompt: string = getCharacterPrompt(
    dateStatus,
    activeCharacter,
    activeLocation,
    getFriendshipLevel,
    getRomanceLevel,
    quests
  );

  const dateLocationIds: number[] = [0, 1, 3, 5];
  const dateLocations: Location[] = locations.filter(
    (location) =>
      location.id !== activeLocation.id &&
      dateLocationIds.indexOf(location.id) > -1
  );

  const activeSkill: Skill =
    skills.find((skill) => skill.id === activeLocation.skillId) || skills[0];

  const attainedBadges = badges.filter((badge) => badge.attained === true);

  const updateProgress = () => {
    const newProgress = JSON.parse(JSON.stringify(baseProgress));

    characters.forEach((character) => {
      Object.keys(friendshipThresholds).forEach((friendshipLevel) => {
        const thresholdFriendshipScore: number =
          friendshipThresholds[friendshipLevel as FriendshipLevel];

        if (
          thresholdFriendshipScore > 0 &&
          character.scores.friendship >= thresholdFriendshipScore
        ) {
          newProgress.friendship[friendshipLevel] += 1;
        } else if (
          thresholdFriendshipScore < 0 &&
          character.scores.friendship <= thresholdFriendshipScore
        ) {
          newProgress.friendship[friendshipLevel] += 1;
        }
      });

      Object.keys(romanceThresholds).forEach((romanceLevel) => {
        const thresholdRomanceScore: number =
          romanceThresholds[romanceLevel as RomanceLevel];

        if (
          thresholdRomanceScore > 0 &&
          character.scores.romance >= thresholdRomanceScore
        ) {
          newProgress.romance[romanceLevel] += 1;
        }
      });
    });

    setProgress(newProgress);
  };

  const updateBadges = () => {
    const unattainedBadges = badges.filter((badge) => badge.attained === false);
    const newlyAttainedBadgeIds: number[] = [];

    unattainedBadges.forEach((badge) => {
      if (badge.type === "friendship") {
        if (
          badge.friendshipLevel &&
          progress.friendship[badge.friendshipLevel] >= badge.amount
        ) {
          newlyAttainedBadgeIds.push(badge.id);
        }
      } else if (badge.type === "romance") {
        if (
          badge.romanceLevel &&
          progress.romance[badge.romanceLevel] >= badge.amount
        ) {
          newlyAttainedBadgeIds.push(badge.id);
        }
      } else if (badge.type === "skill") {
        const currentSkill = skills.find(
          (skill) => skill.name === badge.skillName
        );

        if (currentSkill && currentSkill.level >= badge.amount) {
          newlyAttainedBadgeIds.push(badge.id);
        }
      } else if (badge.type === "quest") {
        const completedQuests = quests.filter(
          (quest) => quest.completed === true
        );

        if (completedQuests && completedQuests.length >= badge.amount) {
          newlyAttainedBadgeIds.push(badge.id);
        }
      }
    });

    const updatedBadges = badges.map((badge) => {
      if (newlyAttainedBadgeIds.indexOf(badge.id) > -1) {
        return { ...badge, attained: true };
      } else {
        return badge;
      }
    });

    setBadges(updatedBadges);
  };

  const updateUnlocks = () => {
    const lockedLocations = locations.filter((location) => location.locked);

    // This is a label
    outerLoop: for (const location of lockedLocations) {
      if (!location.unlock) {
        continue;
      }

      if (location.unlock.friendship) {
        for (const requirement of location.unlock.friendship) {
          if (
            progress.friendship[requirement.friendshipLevel] <
            requirement.amount
          ) {
            // Use the label to break out of both loops
            break outerLoop;
          }
        }
      }

      if (location.unlock.romance) {
        for (const requirement of location.unlock.romance) {
          if (progress.romance[requirement.romanceLevel] < requirement.amount) {
            // Use the label to break out of both loops
            break outerLoop;
          }
        }
      }

      if (location.unlock.skills) {
        for (const requirement of location.unlock.skills) {
          const userSkill = skills.find(
            (skill) => skill.name === requirement.name
          );

          if (!userSkill || userSkill.level < requirement.level) {
            // Use the label to break out of both loops
            break outerLoop;
          }
        }
      }

      const updatedLocations = locations.map((loc) =>
        loc.id === location.id ? { ...loc, locked: false } : loc
      );
      setLocations(updatedLocations);
    }
  };

  useEffect(() => {
    const init = async () => {
      aiRef.current = await getWindowAI();
      if (aiRef.current) {
        toast.success("window.ai detected!", {
          id: "window-ai-detected",
        });
      } else {
        toast.custom(<InstallationToast />, {
          id: "window-ai-not-detected",
        });
      }
    };

    init();
  }, []);

  useEffect(() => {
    updateProgress();
  }, [characters]);

  useEffect(() => {
    updateUnlocks();
    updateBadges();
  }, [progress, skills]);

  const menuSoundRef = soundRef.locations[activeLocation.id].ref;

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-blue-900`}
    >
      {(Object.keys(soundRef.menus) as MenuKey[]).map((menu, i) => (
        <audio
          key={i}
          className="hidden"
          ref={soundRef.menus[menu].ref}
          loop
          controls
        >
          <source src={soundRef.menus[menu].sound} type="audio/wav" />
        </audio>
      ))}
      {(Object.keys(soundRef.interactions) as InteractionsKey[]).map(
        (interaction, i) => (
          <audio
            key={i}
            className="hidden"
            ref={soundRef.interactions[interaction].ref}
            controls
          >
            <source
              src={soundRef.interactions[interaction].sound}
              type="audio/wav"
            />
          </audio>
        )
      )}
      {soundRef.locations.map((location, i) => (
        <audio
          key={i}
          className="hidden"
          ref={soundRef.locations[i].ref}
          loop
          controls
        >
          <source src={soundRef.locations[i].sound} type="audio/wav" />
        </audio>
      ))}
      {activeView === "start" ? (
        <div
          className="w-full h-screen relative overflow-hidden flex items-end shadow-lg"
          style={{
            background: `url('${menus.start.image}')`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute top-0 bg-blue-950 border-b-2 border-blue-950 bg-opacity-90 text-white font-light text-7xl text-center w-full justify-center py-3">
            Boundless Paradise
          </div>
          <div className="flex bg-blue-950 bg-opacity-70 border-t-2 border-blue-950 w-full justify-center py-3">
            <button
              className={`bg-blue-500 hover:bg-blue-400 border-2 border-blue-950 shadow-lg active:shadow-none text-white px-4 py-3 rounded-lg text-4xl font-light`}
              onClick={() =>
                startGame(
                  setActiveView,
                  setCharacterExpression,
                  setActiveCharacterId,
                  setDateStatus,
                  setDisplayMessage,
                  setInputValue,
                  activeLocation,
                  soundRef
                )
              }
            >
              Start Game
            </button>
          </div>
        </div>
      ) : activeView === "map" ? (
        <div className="w-full h-screen relative overflow-hidden flex items-center justify-center flex-wrap shadow-lg bg-blue-950 pt-16">
          <div
            className="w-full h-screen absolute top-0 z-0 opacity-60"
            style={{
              background: `url('${menus.map.image}')`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }}
          />
          <div className="absolute top-0 bg-blue-950 border-b-2 border-blue-950 bg-opacity-80 text-white font-light text-5xl text-center w-full justify-center py-3">
            {dateStatus !== "starting"
              ? "Where would you like to go?"
              : "Where would you like to go on your date?"}
          </div>
          {(dateStatus !== "starting" ? locations : dateLocations).map(
            (location, i) => (
              <div
                key={i}
                className={`flex z-10 rounded-lg shadow-lg active:shadow-none mx-6 cursor-pointer bg-blue-100 ${
                  location.locked && "bg-blue-950"
                }`}
              >
                <div
                  style={{
                    background: `url('${location.image}')`,
                    backgroundSize: "100%",
                    backgroundRepeat: "no-repeat",
                    width: "360px",
                    height: "225px",
                  }}
                  className={`flex items-center border-2 border-blue-950 rounded-lg overflow-hidden hover:opacity-80 ${
                    location.locked && "opacity-40"
                  }`}
                  onClick={() =>
                    selectLocation(
                      location.id,
                      setActiveLocation,
                      setInputValue,
                      setActiveView,
                      dateStatus,
                      activeCharacterId,
                      activeLocation,
                      setCharacters,
                      setCharacterExpression,
                      setDisplayMessage,
                      setDateStatus,
                      characters,
                      locations,
                      soundRef
                    )
                  }
                >
                  <div className="w-full text-center text-3xl font-light bg-blue-950 text-white bg-opacity-70 border-y-2 border-blue-950 py-1">
                    {location.name}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      ) : (
        <div
          className="w-full h-screen relative overflow-hidden shadow-lg"
          style={{
            background: `url("${activeLocation.image}")`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div
            className={`absolute flex z-50 w-full h-full p-3 ${
              activePopup !== "storeItem" && "hidden"
            }`}
          >
            <div className="border-2 rounded-lg border-indigo-950 w-full relative overflow-hidden">
              <div
                className="rounded-full bg-rose-700 hover:bg-rose-600 shadow-lg active:shadow-none border-rose-950 absolute right-1 top-1 text-center text-white border-2 p-1 cursor-pointer"
                onClick={() => setActivePopup("none")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="#ffe4e6"
                  className="w-6 h-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="bg-indigo-950 bg-opacity-95 text-white font-light text-3xl text-center p-1 border-b-2 border-indigo-950">
                {activeStoreItem?.name}
              </div>
              <div className="flex h-full bg-indigo-200 bg-opacity-95">
                <div className="grid grid-cols-2 p-1">
                  <div className="p-1">
                    <Image
                      src={activeStoreItem?.image || ""}
                      width={4096}
                      height={4096}
                      alt="Item"
                      className="rounded-lg overflow-hidden border-2 border-indigo-950 w-full"
                    />
                  </div>
                  <div className="p-1 font-light">
                    <div className="grid grid-cols-2 mb-2">
                      <div
                        className={`rounded-lg border-2 border-green-900 mb-2 overflow-hidden mr-1`}
                      >
                        <div
                          className={`text-xl mr-2 text-green-200 bg-green-900 border-green-900 border-b-2 p-1 w-full text-center`}
                        >
                          Your Money
                        </div>
                        <div
                          className={`text-3xl text-white bg-green-600 p-2 w-full text-center`}
                        >
                          ${thousandSeparator(currentMoney)}
                        </div>
                      </div>
                      <div
                        className={`rounded-lg border-2 border-amber-900 mb-2 overflow-hidden ml-1`}
                      >
                        <div
                          className={`text-xl mr-2 text-amber-200 bg-amber-900 border-amber-900 border-b-2 p-1 w-full text-center`}
                        >
                          Your Inventory
                        </div>
                        <div
                          className={`text-3xl text-white bg-amber-600 p-2 w-full text-center`}
                        >
                          {thousandSeparator(activeStoreItem?.amountOwned ?? 0)}{" "}
                          of this item
                        </div>
                      </div>
                    </div>
                    <div className="text-center text-5xl mb-1">
                      {activeStoreItem?.name}
                    </div>
                    <div className="flex justify-center">
                      <div className="text-center text-3xl text-green-100 border-green-950 border-2 p-1 rounded-lg bg-green-600 mb-2">
                        ${thousandSeparator(activeStoreItem?.price ?? 0)}
                      </div>
                    </div>
                    <div className="text-xl">
                      {activeStoreItem?.description}
                    </div>
                    <div className="font-light">buy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className={`absolute flex z-50 w-full h-full p-3 ${
              activePopup !== "badgeMenu" && "hidden"
            }`}
          >
            <div className="border-2 rounded-lg border-indigo-950 w-full relative overflow-hidden">
              <div
                className="rounded-full bg-rose-700 hover:bg-rose-600 shadow-lg active:shadow-none border-rose-950 absolute right-1 top-1 text-center text-white border-2 p-1 cursor-pointer"
                onClick={() => setActivePopup("none")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="#ffe4e6"
                  className="w-6 h-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="bg-indigo-950 bg-opacity-95 text-white font-light text-3xl text-center p-1 border-b-2 border-indigo-950">
                Badges
              </div>
              <div className="bg-indigo-600 bg-opacity-95 text-indigo-100 font-light text-center text-2xl p-2 border-b-2 border-indigo-950">
                Collect every badge to become the{" "}
                <span className="text-yellow-300 text-2xl">
                  Champion of Boundless Paradise
                </span>
              </div>
              <div className="bg-indigo-400 bg-opacity-95 text-indigo-100 font-light text-center text-6xl p-3 border-b-2 border-indigo-950">
                You have{" "}
                <span className="text-yellow-300">{attainedBadges.length}</span>{" "}
                of <span className="text-yellow-300">{badges.length}</span>{" "}
                badges
              </div>
              <div
                className="h-full overflow-scroll bg-indigo-200 bg-opacity-95"
                style={{ paddingBottom: "185px" }}
              >
                <div>
                  <div className="grid grid-cols-4 items-center p-2">
                    {badges
                      .filter((badge) => badge.attained === true)
                      .map((badge, i) => (
                        <BadgeCard badge={badge} />
                      ))}
                    {badges
                      .filter((badge, i) => badge.attained === false)
                      .map((badge, i) => (
                        <BadgeCard badge={badge} />
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {activeCharacterId !== null && activeCharacter !== null ? (
            <>
              <div className="flex absolute z-10 top-3 w-full">
                <div className="flex mx-auto">
                  <div
                    className={`${
                      friendshipScoreChange >= 0
                        ? "border-teal-950"
                        : "border-rose-950"
                    } rounded-lg shadow-lg border-2 mb-2 overflow-hidden mx-2 opacity-0 ${
                      scoreChangeAnimating && "animate-fadeInOut"
                    }`}
                  >
                    <div
                      className={`${
                        friendshipScoreChange >= 0
                          ? "bg-teal-900 text-teal-200 border-teal-950"
                          : "bg-rose-900 text-rose-200 border-rose-950"
                      } text-xl font-light mr-2  border-b-2 p-1 w-full text-center`}
                    >
                      Friendship
                    </div>
                    <div
                      className={`${
                        friendshipScoreChange >= 0
                          ? "bg-teal-600"
                          : "bg-rose-600"
                      } text-3xl text-white font-light px-2 py-1 w-full text-center`}
                    >
                      {friendshipScoreChange > 0 && "+"}
                      {thousandSeparator(friendshipScoreChange)}
                    </div>
                  </div>
                  <div
                    className={`border-sky-950 rounded-lg shadow-lg border-2 mb-2 overflow-hidden mx-2 opacity-0 ${
                      skillChange <= 0 && "hidden"
                    } ${scoreChangeAnimating && "animate-fadeInOut"}`}
                  >
                    <div
                      className={`bg-sky-900 text-sky-200 border-sky-950 text-xl font-light mr-2  border-b-2 p-1 w-full text-center capitalize`}
                    >
                      {activeSkill.name}
                    </div>
                    <div
                      className={`bg-sky-600 text-3xl text-white font-light px-2 py-1 w-full text-center`}
                    >
                      {"+"}
                      {thousandSeparator(skillChange)}
                    </div>
                  </div>
                  <div
                    className={`${
                      romanceScoreChange >= 0
                        ? "border-teal-950"
                        : "border-rose-950"
                    } rounded-lg shadow-lg border-2 mb-2 overflow-hidden mx-2 opacity-0 ${
                      !activeCharacter.dating && "hidden"
                    } ${scoreChangeAnimating && "animate-fadeInOut"}`}
                  >
                    <div
                      className={`${
                        romanceScoreChange >= 0
                          ? "bg-teal-900 text-teal-200 border-teal-950"
                          : "bg-rose-900 text-rose-200 border-rose-950"
                      } text-xl font-light mr-2  border-b-2 p-1 w-full text-center px-2`}
                    >
                      Romance
                    </div>
                    <div
                      className={`${
                        romanceScoreChange >= 0 ? "bg-teal-600" : "bg-rose-600"
                      } text-3xl text-white font-light px-2 py-1 w-full text-center`}
                    >
                      {romanceScoreChange > 0 && "+"}
                      {thousandSeparator(romanceScoreChange)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute z-10 top-3 left-3 rounded-lg border-2 border-indigo-950 overflow-hidden font-light shadow-lg">
                <div className="w-full text-center font-light bg-indigo-950 border-b-2 border-indigo-950 bg-opacity-70 pt-1 pb-2">
                  <div
                    className="text-3xl text-white"
                    style={{ lineHeight: "100%" }}
                  >
                    You
                  </div>
                </div>
                <div className="flex flex-col p-2 bg-indigo-200 bg-opacity-70">
                  <div
                    className={`rounded-lg border-2 border-green-900 mb-2 overflow-hidden`}
                  >
                    <div
                      className={`text-xl mr-2 text-green-200 bg-green-900 border-green-900 border-b-2 p-1 w-full text-center`}
                    >
                      Money
                    </div>
                    <div
                      className={`text-3xl text-white bg-green-600 p-2 w-full text-center`}
                    >
                      ${thousandSeparator(currentMoney)}
                    </div>
                  </div>
                  <div
                    className={`rounded-lg border-2 border-sky-900 mb-2 overflow-hidden`}
                  >
                    <div
                      className={`text-xl mr-2 text-sky-200 bg-sky-900 border-sky-900 border-b-2 p-1 w-full text-center`}
                    >
                      Skills
                    </div>
                    <div className="bg-sky-600">
                      {skills.map((skill, i) => (
                        <div
                          key={i}
                          className={`flex justify-between text-lg text-white w-full px-2 py-1 border-sky-900 ${
                            i < skills.length - 1 && "border-b-2"
                          }`}
                        >
                          <div className="capitalize mr-2 text-sky-100">
                            {skill.name}
                          </div>
                          <div className="ml-2">
                            {thousandSeparator(skill.level)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button className="bg-amber-500 hover:bg-amber-400 border-2 border-amber-950 shadow-lg active:shadow-none text-white rounded-lg px-4 py-2 text-lg font-light mb-2">
                    Inventory
                  </button>
                  <button className="bg-indigo-400 hover:bg-indigo-300 border-2 border-indigo-950 shadow-lg active:shadow-none text-white rounded-lg px-4 py-2 text-lg font-light mb-2">
                    Quests
                  </button>
                  <button
                    className="bg-orange-500 hover:bg-orange-400 border-2 border-orange-950 shadow-lg active:shadow-none text-white rounded-lg px-4 py-2 text-lg font-light mb-2"
                    onClick={() => setActivePopup("badgeMenu")}
                  >
                    Badges ({attainedBadges.length} of {badges.length})
                  </button>
                  {["active", "finished"].indexOf(dateStatus) === -1 && (
                    <button
                      className="bg-purple-600 hover:bg-purple-500 border-2 border-purple-950 shadow-lg active:shadow-none text-white rounded-lg px-4 py-2 text-lg font-light"
                      onClick={() =>
                        goToMap(
                          setActiveView,
                          setCharacterExpression,
                          setActiveCharacterId,
                          setDateStatus,
                          setDisplayMessage,
                          setInputValue,
                          activeLocation,
                          soundRef
                        )
                      }
                    >
                      Go To Map
                    </button>
                  )}
                </div>
              </div>
              <div className="absolute z-10 top-3 right-3 rounded-lg border-2 border-indigo-950 overflow-hidden font-light shadow-lg">
                <div className="w-full text-center font-light bg-indigo-950 border-b-2 border-indigo-950 bg-opacity-70 pt-1 pb-2">
                  <div
                    className="text-3xl text-white"
                    style={{ lineHeight: "100%" }}
                  >
                    {activeCharacter?.name}
                  </div>
                  <div
                    className="text-lg text-indigo-200"
                    style={{ lineHeight: "100%" }}
                  >
                    Age {activeCharacter?.age}
                  </div>
                </div>
                <div className="flex flex-col p-2 bg-indigo-200 bg-opacity-70">
                  <div
                    className={`rounded-lg border-2 ${
                      activeCharacter?.scores.friendship >= 0
                        ? "border-teal-900"
                        : "border-rose-900"
                    } mb-2 overflow-hidden`}
                  >
                    <div
                      className={`text-xl mr-2 ${
                        activeCharacter?.scores.friendship >= 0
                          ? "text-teal-200 bg-teal-900 border-teal-900"
                          : "text-rose-200 bg-rose-900 border-rose-900"
                      } border-b-2 p-1 w-full text-center`}
                    >
                      Friendship Level
                    </div>
                    <div
                      className={`text-3xl text-white ${
                        activeCharacter?.scores.friendship >= 0
                          ? "bg-teal-600"
                          : "bg-rose-600"
                      } p-2 w-full text-center`}
                    >
                      {getFriendshipLevel(activeCharacter.scores.friendship)}
                    </div>
                  </div>
                  <div
                    className={`rounded-lg border-2 ${
                      activeCharacter?.scores.friendship >= 0
                        ? "border-cyan-900"
                        : "border-orange-900"
                    } mb-2 overflow-hidden`}
                  >
                    <div
                      className={`text-xl mr-2 ${
                        activeCharacter?.scores.friendship >= 0
                          ? "text-cyan-200 bg-cyan-900 border-cyan-900"
                          : "text-orange-200 bg-orange-900 border-orange-900"
                      } border-b-2 p-1 w-full text-center`}
                    >
                      Friendship Score
                    </div>
                    <div
                      className={`text-3xl text-white ${
                        activeCharacter?.scores.friendship >= 0
                          ? "bg-cyan-600"
                          : "bg-orange-600"
                      } p-2 w-full text-center`}
                    >
                      {thousandSeparator(activeCharacter.scores.friendship)}
                    </div>
                  </div>
                  {activeCharacter.dating && (
                    <>
                      <div
                        className={`rounded-lg border-2 border-violet-900 mb-2 overflow-hidden`}
                      >
                        <div
                          className={`text-xl mr-2 text-violet-200 bg-violet-900 border-violet-900 border-b-2 p-1 w-full text-center`}
                        >
                          Romance Level
                        </div>
                        <div
                          className={`text-3xl text-white bg-violet-600 p-2 w-full text-center`}
                        >
                          {getRomanceLevel(activeCharacter.scores.romance)}
                        </div>
                      </div>
                      <div
                        className={`rounded-lg border-2 border-fuchsia-900 mb-2 overflow-hidden`}
                      >
                        <div
                          className={`text-xl mr-2 text-fuchsia-200 bg-fuchsia-900 border-fuchsia-900 border-b-2 p-1 w-full text-center`}
                        >
                          Romance Score
                        </div>
                        <div
                          className={`text-3xl text-white bg-fuchsia-600 p-2 w-full text-center`}
                        >
                          {thousandSeparator(activeCharacter.scores.romance)}
                        </div>
                      </div>
                      {dateStatus === "none" && (
                        <button
                          className={`bg-red-700 ${
                            !loading && `hover:bg-red-600 active:shadow-none`
                          } border-2 border-red-950 shadow-lg text-white rounded-lg px-4 py-2 text-lg font-light mb-2`}
                          disabled={loading}
                          onClick={() =>
                            breakUp(
                              aiRef,
                              setScoreChangeAnimating,
                              setCharacterExpression,
                              setFriendshipScoreChange,
                              setRomanceScoreChange,
                              setSkillChange,
                              setSkills,
                              skills,
                              activeSkill,
                              setDisplayMessage,
                              setCharacters,
                              setInputValue,
                              setDateStatus,
                              setLoading,
                              activeCharacter,
                              latestMessage,
                              activeCharacterId,
                              characterExpression,
                              activeLocation,
                              characterPrompt,
                              characters,
                              inputValue,
                              soundRef
                            )
                          }
                        >
                          Break Up
                        </button>
                      )}
                    </>
                  )}
                  {dateStatus === "none" && (
                    <button
                      className={`bg-pink-600 ${
                        !loading && `hover:bg-pink-500 active:shadow-none`
                      } border-2 border-pink-950 shadow-lg text-white rounded-lg px-4 py-2 text-lg font-light mb-2 ${
                        loading ? "opacity-70" : ""
                      }`}
                      onClick={() =>
                        askOnDate(
                          activeCharacter?.scores.friendship,
                          aiRef,
                          setScoreChangeAnimating,
                          setCharacterExpression,
                          setFriendshipScoreChange,
                          setRomanceScoreChange,
                          setSkillChange,
                          setSkills,
                          skills,
                          activeSkill,
                          setDisplayMessage,
                          setCharacters,
                          setInputValue,
                          setDateStatus,
                          setLoading,
                          activeCharacter,
                          latestMessage,
                          activeCharacterId,
                          characterExpression,
                          activeLocation,
                          characterPrompt,
                          characters,
                          inputValue,
                          soundRef
                        )
                      }
                      disabled={loading}
                    >
                      {!loading ? "Ask On Date" : "..."}
                    </button>
                  )}
                  <button className="bg-indigo-400 hover:bg-indigo-300 border-2 border-indigo-950 shadow-lg active:shadow-none text-white rounded-lg px-4 py-2 text-lg font-light mb-2">
                    Ask For Quest
                  </button>
                  {dateStatus === "active" ? (
                    <button
                      className="bg-purple-600 hover:bg-purple-500 border-2 border-purple-950 shadow-lg active:shadow-none text-white rounded-lg px-4 py-2 text-lg font-light"
                      onClick={() =>
                        finishDate(
                          aiRef,
                          setScoreChangeAnimating,
                          setCharacterExpression,
                          setFriendshipScoreChange,
                          setRomanceScoreChange,
                          setSkillChange,
                          setSkills,
                          skills,
                          activeSkill,
                          setDisplayMessage,
                          setCharacters,
                          setInputValue,
                          setDateStatus,
                          setLoading,
                          activeCharacter,
                          latestMessage,
                          activeCharacterId,
                          characterExpression,
                          activeLocation,
                          characterPrompt,
                          characters,
                          inputValue,
                          soundRef
                        )
                      }
                    >
                      Finish Date
                    </button>
                  ) : (
                    dateStatus !== "finished" && (
                      <button
                        className="bg-purple-600 hover:bg-purple-500 border-2 border-purple-950 shadow-lg active:shadow-none text-white rounded-lg px-4 py-2 text-lg font-light"
                        onClick={() =>
                          leaveConversation(
                            setCharacterExpression,
                            setActiveCharacterId,
                            setDateStatus,
                            setDisplayMessage,
                            setInputValue
                          )
                        }
                      >
                        Leave Conversation
                      </button>
                    )
                  )}
                </div>
              </div>
              <div className="flex">
                <Image
                  src={`/images/characters/${activeCharacterId}/${
                    expressions.indexOf(characterExpression) >= 0
                      ? characterExpression
                      : "expressionless"
                  }.png`}
                  width={698}
                  height={1}
                  alt="Character"
                  className="mx-auto"
                  style={{
                    height: "100vh",
                    width: "auto",
                    pointerEvents: "none",
                  }}
                />
                <div
                  className={`absolute bottom-14 border-t-2 border-blue-950 ${
                    displayMessage?.role === "assistant"
                      ? "bg-blue-100"
                      : "bg-emerald-100"
                  } bg-opacity-80 p-3 pb-5 text-xl font-light whitespace-pre-wrap w-full ${
                    !displayMessage?.content &&
                    displayMessage?.role !== "assistant" &&
                    "hidden"
                  } max-height-200`}
                  style={{
                    minHeight: "62px",
                  }}
                >
                  {displayMessage.content}
                </div>
              </div>
              {dateStatus === "saidYes" ? (
                <div className="flex justify-center bg-blue-300 p-2 absolute bottom-0 w-full border-t-2 border-blue-950">
                  <button
                    className={`bg-emerald-600 hover:bg-emerald-500 active:shadow-none border-2 border-emerald-950 shadow-lg text-white rounded-lg px-4 py-2 text-lg font-light mx-2`}
                    onClick={() =>
                      startDate(
                        setDateStatus,
                        setInputValue,
                        setActiveView,
                        activeLocation,
                        soundRef
                      )
                    }
                  >
                    Start Date
                  </button>
                  <button
                    className={`bg-rose-600 hover:bg-rose-500 active:shadow-none border-2 border-rose-950 shadow-lg text-white rounded-lg px-4 py-2 text-lg font-light mx-2`}
                    onClick={() =>
                      cancelDate(
                        aiRef,
                        setScoreChangeAnimating,
                        setCharacterExpression,
                        setFriendshipScoreChange,
                        setRomanceScoreChange,
                        setSkillChange,
                        setSkills,
                        skills,
                        activeSkill,
                        setDisplayMessage,
                        setCharacters,
                        setInputValue,
                        setDateStatus,
                        setLoading,
                        activeCharacter,
                        latestMessage,
                        activeCharacterId,
                        characterExpression,
                        activeLocation,
                        characterPrompt,
                        characters,
                        inputValue,
                        soundRef
                      )
                    }
                  >
                    Cancel Date
                  </button>
                </div>
              ) : dateStatus === "finished" ? (
                <div className="flex justify-center bg-blue-300 p-2 absolute bottom-0 w-full border-t-2 border-blue-950">
                  <button
                    className={`bg-pink-600 hover:bg-pink-500 active:shadow-none border-2 border-pink-950 shadow-lg text-white rounded-lg px-4 py-2 text-lg font-light mx-2`}
                    onClick={() =>
                      goToMap(
                        setActiveView,
                        setCharacterExpression,
                        setActiveCharacterId,
                        setDateStatus,
                        setDisplayMessage,
                        setInputValue,
                        activeLocation,
                        soundRef
                      )
                    }
                  >
                    Leave Date
                  </button>
                </div>
              ) : (
                ["saidYes", "finished"].indexOf(dateStatus) === -1 && (
                  <form
                    onSubmit={(event) =>
                      sendMessage(
                        aiRef,
                        setScoreChangeAnimating,
                        setCharacterExpression,
                        setFriendshipScoreChange,
                        setRomanceScoreChange,
                        setSkillChange,
                        setSkills,
                        skills,
                        activeSkill,
                        setDisplayMessage,
                        setCharacters,
                        setInputValue,
                        setDateStatus,
                        setLoading,
                        activeCharacter,
                        latestMessage,
                        activeCharacterId,
                        characterExpression,
                        activeLocation,
                        characterPrompt,
                        characters,
                        inputValue,
                        soundRef,
                        "none",
                        event
                      )
                    }
                    className="flex bg-blue-300 p-2 absolute bottom-0 w-full border-t-2 border-blue-950"
                  >
                    <input
                      type="text"
                      value={inputValue}
                      placeholder="Say something..."
                      onChange={(e) => setInputValue(e.target.value)}
                      className="flex-grow bg-blue-200 focus:bg-blue-100 border-2 border-blue-950 shadow-lg rounded-lg p-2 text-xl font-light focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className={`ml-2 bg-blue-500 ${
                        !loading && `hover:bg-blue-400 active:shadow-none`
                      } border-2 border-blue-950 shadow-lg text-white px-4 py-2 rounded-lg text-lg font-light ${
                        loading ? "opacity-70" : ""
                      }`}
                    >
                      {!loading ? "Go" : "..."}
                    </button>
                  </form>
                )
              )}
            </>
          ) : (
            <div className="flex w-full h-screen items-center justify-center">
              {["active", "finished"].indexOf(dateStatus) === -1 && (
                <button
                  className="bg-purple-600 hover:bg-purple-500 border-2 border-purple-950 shadow-lg active:shadow-none text-white rounded-lg px-4 py-2 text-lg font-light absolute top-3 left-3 z-10"
                  onClick={() =>
                    goToMap(
                      setActiveView,
                      setCharacterExpression,
                      setActiveCharacterId,
                      setDateStatus,
                      setDisplayMessage,
                      setInputValue,
                      activeLocation,
                      soundRef
                    )
                  }
                >
                  Map
                </button>
              )}
              {activeLocation.id !== 1 ? (
                <>
                  <div className="absolute top-0 bg-blue-950 border-b-2 border-blue-950 bg-opacity-80 text-white font-light text-5xl text-center w-full justify-center py-3">
                    Who would you like to talk to?
                  </div>
                  {activeLocation.characters.map((characterId, i) => (
                    <CharacterCard
                      key={i}
                      characters={characters}
                      setActiveCharacterId={setActiveCharacterId}
                      setInputValue={setInputValue}
                      characterId={characterId}
                    />
                  ))}
                </>
              ) : (
                <>
                  <div className="absolute top-0 bg-blue-950 border-b-2 border-blue-950 bg-opacity-80 text-white font-light text-5xl text-center w-full justify-center py-3">
                    What would you like to buy?
                  </div>
                  <div
                    className="grid grid-cols-3 items-center overflow-scroll"
                    style={{
                      height: "calc(100vh - 68px",
                      marginTop: "80px",
                      paddingTop: "20px",
                    }}
                  >
                    {items.map((item, i) => (
                      <div className="mb-4">
                        <ItemCard
                          key={i}
                          item={item}
                          setActiveStoreItem={setActiveStoreItem}
                          setActivePopup={setActivePopup}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
      <Toaster />
    </div>
  );
};

export default App;
