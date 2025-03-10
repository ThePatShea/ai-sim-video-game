import Skill from "../interfaces/skill";

const updateSkill = (
  multiplier: number,
  setSkillChange: (amount: number) => void,
  setSkills: (skill: Skill[]) => void,
  skills: Skill[],
  activeSkill: Skill
) => {
  if (multiplier <= 0) {
    setSkillChange(0);
    return;
  }

  let scoreChange =
    (Math.floor(Math.random() * 5) + 1) * multiplier * 2 +
    (Math.floor(Math.random() * 3) + 1);
  setSkillChange(scoreChange);

  let updatedSkills = [...skills];

  const skillPosition = updatedSkills.findIndex(
    (skill) => skill.id === activeSkill.id
  );

  updatedSkills[skillPosition].level += scoreChange;
  setSkills(updatedSkills);
};

export default updateSkill;
