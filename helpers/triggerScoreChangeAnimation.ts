const triggerScoreChangeAnimation = (
  setScoreChangeAnimating: (value: boolean) => void
) => {
  setScoreChangeAnimating(true);

  setTimeout(() => {
    setScoreChangeAnimating(false);
  }, 2000); // Match this duration with the animation duration from the CSS stylesheet
};

export default triggerScoreChangeAnimation;
