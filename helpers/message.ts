import { ChatMessage, MessageOutput, WindowAI } from "window.ai";
import InstallationToast from "@/components/toast";
import toast from "react-hot-toast";

import Character from "../interfaces/character";
import Location from "../interfaces/location";
import Skill from "../interfaces/skill";

import updateFriendshipScore from "./updateFriendshipScore";
import updateRomanceScore from "./updateRomanceScore";
import updateSkill from "./updateSkill";

import setFriendshipScore from "./setFriendshipScore";
import setRomanceScore from "./setRomanceScore";
import expressions from "./expressions.json";

type MessageAction =
  | "askingOnDate"
  | "cancelingDate"
  | "finishingDate"
  | "breakingUp"
  | "none";

const sendMessage = async (
  aiRef: React.RefObject<WindowAI | null>,
  setScoreChangeAnimating: (animating: boolean) => void,
  setCharacterExpression: (expression: string) => void,
  setFriendshipScoreChange: (change: number) => void,
  setRomanceScoreChange: (change: number) => void,
  setSkillChange: (amount: number) => void,
  setSkills: (skill: Skill[]) => void,
  skills: Skill[],
  activeSkill: Skill,
  setDisplayMessage: (message: ChatMessage) => void,
  setCharacters: (characters: Character[]) => void,
  setInputValue: (inputValue: string) => void,
  setDateStatus: (status: string) => void,
  setLoading: (loading: boolean) => void,
  activeCharacter: Character | null,
  latestMessage: ChatMessage | null,
  activeCharacterId: number | null,
  characterExpression: string,
  activeLocation: Location,
  characterPrompt: string,
  characters: Character[],
  inputValue: string,
  soundRef: any,
  action: MessageAction = "none",
  event: React.FormEvent<HTMLFormElement> | null = null,
  acceptingDate: boolean = false,
  newFriendshipScore: number | null = null
) => {
  if (event) event.preventDefault();

  const userWords =
    action === "askingOnDate"
      ? "Would you like to go on a date with me?"
      : action === "cancelingDate"
      ? "Let's cancel the date."
      : action === "finishingDate"
      ? "This date was fun! See you later!"
      : action === "breakingUp"
      ? "I think we should break up."
      : inputValue;

  if (!userWords) return;

  if (activeCharacterId === null) return;

  if (!activeCharacter) return;

  if (!aiRef.current) {
    console.log("Window.AI not detected.");
    return;
  }

  const userMessage: ChatMessage = { role: "user", content: userWords };
  setDisplayMessage(userMessage);
  //creates a local variable to handle streaming state

  let updatedCharacters: Character[] = [...characters];

  const updatedMessages = [...activeCharacter.messages, userMessage];

  updatedCharacters[activeCharacterId].messages = updatedMessages;

  setCharacters(updatedCharacters);
  setLoading(true);
  setInputValue("");

  //streaming options settings for window.ai
  const streamingOptions = {
    temperature: 0.7,
    maxTokens: 1000,
    onStreamResult: (result: MessageOutput | null, error: string | null) => {
      if (error) {
        toast.error("window.ai streaming completion failed.");
        return;
      } else if (result) {
        const lastMessage =
          updatedCharacters[activeCharacterId].messages[
            updatedCharacters[activeCharacterId].messages.length - 1
          ];
        // if the last message is from a user, init a new message
        if (lastMessage.role === "user") {
          updatedCharacters[activeCharacterId].messages = [
            ...updatedCharacters[activeCharacterId].messages,
            {
              role: "assistant",
              content: result.message.content,
            },
          ];
        } else {
          // if the last message is from the assistant, append the streaming result to the last message
          updatedCharacters[activeCharacterId].messages = updatedCharacters[
            activeCharacterId
          ].messages.map((message, index) => {
            if (
              index ===
              updatedCharacters[activeCharacterId].messages.length - 1
            ) {
              return {
                ...message,
                content: message.content + result.message.content,
              };
            }
            return message;
          });
        }

        setDisplayMessage(
          updatedCharacters[activeCharacterId].messages[
            updatedCharacters[activeCharacterId].messages.length - 1
          ]
        );
        setCharacters(updatedCharacters);
      }
    },
  };
  //function call to window.ai to generate text, using our streaming options
  try {
    const unusedExpressions: string[] = expressions.filter(
      (expression) => expression !== characterExpression
    );

    const expressionPrompt: string = `
        Example Responses:

        Example 1: joyful
        Example 2: angry
        Example 3: curious

        -----

        You are a character expression generator. You will read the text that the user said and decide what emotional expression the character would most likely have in response to what the user said.
        
        You MUST choose one of the following expressions: ${unusedExpressions}

        You ABSOLUTELY CANNOT choose an expression that is not on that list. If your ideal expression is not on that list, scrap it and choose an expression from that list that is closest to your ideal expression.

        You will return only one single word: the character's most likely emotional expression.

        Here is what the character just said (this will be blank if it's the start of a new conversation): ${
          latestMessage?.content || ""
        }

        Here is what the user just said in response to what the character just said (DO NOT RESPOND TO WHAT THE USER SAID. JUST PICK ONE EMOTIONAL EXPRESSION FROM THE LIST.): ${
          userMessage.content
        }

        -----

        DO NOT RESPOND TO WHAT THE USER SAID. JUST PICK ONE EMOTIONAL EXPRESSION FROM THE LIST.

        -----
        Here is the character info:

        Name: ${activeCharacter.name}
    
        Age: ${activeCharacter.age}
    
        Gender: ${activeCharacter.gender}
    
        Personality: ${activeCharacter.personality}
    
        Backstory: ${activeCharacter.backstory}
    
        Appearance: ${activeCharacter.appearance}
    
    
        The user and the character are currently at a location. Here is the location info:
    
        Name: ${activeLocation.name}
    
        Description: ${activeLocation.description}
        -----

        What is the character's most likely emotional expression in response to what the user said?

        You MUST choose one of the following expressions: ${unusedExpressions}

        Example Responses:

        Example 1: joyful
        Example 2: angry
        Example 3: curious

        Return the expression in lowercase with no extra spacing.
      `;

    const characterExpressionRes = await aiRef.current.generateText({
      messages: [{ role: "system", content: expressionPrompt }],
    });

    const updatedCharacterExpression = characterExpressionRes[0].message.content
      .trim()
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ""); // Remove whitespace and puncturation. Make it lowercase.

    setCharacterExpression(updatedCharacterExpression);

    console.log("New expression: " + characterExpressionRes[0].message.content); // TO DO: Remove this console log when done testing character expressions

    const datePromptAddition: string = `The user (the person you are talking to) just asked you out on a date. You will say ${
      acceptingDate ? "yes" : "no"
    }.`;

    let characterText;
    let dateText;

    if (action !== "askingOnDate") {
      characterText = await aiRef.current.generateText(
        {
          messages: [
            {
              role: "system",
              content: `${characterPrompt}. This is your current emotional expression: ${characterExpressionRes[0].message.content}. Your response will truly embody the emotional expression of ${characterExpressionRes[0].message.content}.`,
            },
            ...updatedCharacters[activeCharacterId].messages,
          ],
        },
        streamingOptions
      );
    } else {
      dateText = await aiRef.current.generateText(
        {
          messages: [
            {
              role: "system",
              content: `${characterPrompt}. This is your current emotional expression: ${characterExpressionRes[0].message.content}. Your response will truly embody the emotional expression of ${characterExpressionRes[0].message.content}. ${datePromptAddition}`,
            },
            ...updatedCharacters[activeCharacterId].messages,
          ],
        },
        streamingOptions
      );

      if (acceptingDate) {
        setDateStatus("saidYes");
      }

      if (newFriendshipScore !== null) {
        setFriendshipScore(
          newFriendshipScore,
          setCharacters,
          activeCharacterId,
          characters
        );
      }
    }

    setLoading(false);

    if (characterText) {
      const scoreFriendshipPrompt: string = `
          You are a friendship meter. You will read a conversation between two people, then you will determine if that conversation made their friendship better or worse.

          You must return one of the following numbers:

          If their friendship got slightly better, return: 1
          If their friendship got moderately better, return: 2
          If their friendship got significantly better, return: 3
          If their friendship got overwhelmingly better, return: 4
          If their friendship got unbelievably better, return: 5

          If their friendship got slightly worse, return: -1
          If their friendship got moderately worse, return: -2
          If their friendship got significantly worse, return: -3
          If their friendship got overwhelmingly worse, return: -4
          If their friendship got unbelievably worse, return: -5

          You will only return one of those numbers. You will not respond to anything the people said. You will not say anything other than one of those numbers.

          -----

          Here is the coversation:

          Person 1: ${userMessage.content}

          Person 2: ${characterText[0].message.content}

          ----

          How much better or worse did their friendship get? (return one of those numbers)
        `;

      const friendshipScoreChangeRes = await aiRef.current.generateText({
        messages: [{ role: "system", content: scoreFriendshipPrompt }],
      });

      let friendshipScoreMultiplier = parseInt(
        friendshipScoreChangeRes[0].message.content
      );

      if (action === "breakingUp") {
        friendshipScoreMultiplier = Math.abs(friendshipScoreMultiplier) * -10;
      }

      updateFriendshipScore(
        friendshipScoreMultiplier,
        activeCharacterId,
        setFriendshipScoreChange,
        setCharacters,
        setScoreChangeAnimating,
        characters,
        soundRef
      );
      updateSkill(
        friendshipScoreMultiplier,
        setSkillChange,
        setSkills,
        skills,
        activeSkill
      );

      if (activeCharacter.dating) {
        updateRomanceScore(
          friendshipScoreMultiplier,
          activeCharacterId,
          setRomanceScoreChange,
          setCharacters,
          characters
        );
      }
    }
  } catch (e) {
    toast.error("window.ai generation completion failed.");
    console.error(e);
  }
};

const askOnDate = (
  friendshipScore: number | undefined,
  aiRef: React.RefObject<WindowAI | null>,
  setScoreChangeAnimating: (animating: boolean) => void,
  setCharacterExpression: (expression: string) => void,
  setFriendshipScoreChange: (change: number) => void,
  setRomanceScoreChange: (change: number) => void,
  setSkillChange: (amount: number) => void,
  setSkills: (skill: Skill[]) => void,
  skills: Skill[],
  activeSkill: Skill,
  setDisplayMessage: (message: ChatMessage) => void,
  setCharacters: (characters: Character[]) => void,
  setInputValue: (inputValue: string) => void,
  setDateStatus: (status: string) => void,
  setLoading: (loading: boolean) => void,
  activeCharacter: Character | null,
  latestMessage: ChatMessage | null,
  activeCharacterId: number | null,
  characterExpression: string,
  activeLocation: Location,
  characterPrompt: string,
  characters: Character[],
  inputValue: string,
  soundRef: any
) => {
  if (friendshipScore === undefined) return false;
  if (activeCharacter === null) return false;

  if (activeCharacter.dating) {
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
      "askingOnDate",
      null,
      true
    );

    return;
  }

  const multiplier = Math.floor(Math.random() * 100) + 1;

  const askScore = multiplier * friendshipScore;

  if (askScore >= -5000) {
    // TO DO: Change back to positive 5000
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
      "askingOnDate",
      null,
      true
    );
  } else {
    const newFriendshipScore = friendshipScore - multiplier;
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
      "askingOnDate",
      null,
      false,
      newFriendshipScore
    );
  }
};

const breakUp = (
  aiRef: React.RefObject<WindowAI | null>,
  setScoreChangeAnimating: (animating: boolean) => void,
  setCharacterExpression: (expression: string) => void,
  setFriendshipScoreChange: (change: number) => void,
  setRomanceScoreChange: (change: number) => void,
  setSkillChange: (amount: number) => void,
  setSkills: (skill: Skill[]) => void,
  skills: Skill[],
  activeSkill: Skill,
  setDisplayMessage: (message: ChatMessage) => void,
  setCharacters: (characters: Character[]) => void,
  setInputValue: (inputValue: string) => void,
  setDateStatus: (status: string) => void,
  setLoading: (loading: boolean) => void,
  activeCharacter: Character | null,
  latestMessage: ChatMessage | null,
  activeCharacterId: number | null,
  characterExpression: string,
  activeLocation: Location,
  characterPrompt: string,
  characters: Character[],
  inputValue: string,
  soundRef: any
) => {
  if (activeCharacterId === null) return;

  let updatedCharacters = [...characters];
  updatedCharacters[activeCharacterId].dating = false;
  setCharacters(updatedCharacters);

  setRomanceScore(0, setCharacters, activeCharacterId, characters);

  setDateStatus("none");
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
    "breakingUp"
  );
};

const cancelDate = (
  aiRef: React.RefObject<WindowAI | null>,
  setScoreChangeAnimating: (animating: boolean) => void,
  setCharacterExpression: (expression: string) => void,
  setFriendshipScoreChange: (change: number) => void,
  setRomanceScoreChange: (change: number) => void,
  setSkillChange: (amount: number) => void,
  setSkills: (skill: Skill[]) => void,
  skills: Skill[],
  activeSkill: Skill,
  setDisplayMessage: (message: ChatMessage) => void,
  setCharacters: (characters: Character[]) => void,
  setInputValue: (inputValue: string) => void,
  setDateStatus: (status: string) => void,
  setLoading: (loading: boolean) => void,
  activeCharacter: Character | null,
  latestMessage: ChatMessage | null,
  activeCharacterId: number | null,
  characterExpression: string,
  activeLocation: Location,
  characterPrompt: string,
  characters: Character[],
  inputValue: string,
  soundRef: any
) => {
  setDateStatus("none");
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
    "cancelingDate"
  );
};

const finishDate = (
  aiRef: React.RefObject<WindowAI | null>,
  setScoreChangeAnimating: (animating: boolean) => void,
  setCharacterExpression: (expression: string) => void,
  setFriendshipScoreChange: (change: number) => void,
  setRomanceScoreChange: (change: number) => void,
  setSkillChange: (amount: number) => void,
  setSkills: (skill: Skill[]) => void,
  skills: Skill[],
  activeSkill: Skill,
  setDisplayMessage: (message: ChatMessage) => void,
  setCharacters: (characters: Character[]) => void,
  setInputValue: (inputValue: string) => void,
  setDateStatus: (status: string) => void,
  setLoading: (loading: boolean) => void,
  activeCharacter: Character | null,
  latestMessage: ChatMessage | null,
  activeCharacterId: number | null,
  characterExpression: string,
  activeLocation: Location,
  characterPrompt: string,
  characters: Character[],
  inputValue: string,
  soundRef: any
) => {
  setDateStatus("finished");
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
    "finishingDate"
  );
  setInputValue("");
};

export { sendMessage, askOnDate, breakUp, cancelDate, finishDate };
