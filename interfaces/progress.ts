interface Friendship {
  BFF: number;
  "Best Friend": number;
  Inseparable: number;
  "Close Friend": number;
  "Great Friend": number;
  "Good Friend": number;
  Friend: number;
  Buddy: number;
  Pal: number;
  Acquaintance: number;
  Opponent: number;
  Rival: number;
  Foe: number;
  Adversary: number;
  Antagonist: number;
  Enemy: number;
  Villain: number;
  Malefactor: number;
  Nemesis: number;
  "Arch Nemesis": number;
}

interface Romance {
  Soulmate: number;
  "In Love": number;
  Cherished: number;
  Devoted: number;
  Committed: number;
  Harmonious: number;
  Enamored: number;
  Romantic: number;
  Interested: number;
  Flirty: number;
}

interface Progress {
  friendship: Friendship;
  romance: Romance;
}

export default Progress;
