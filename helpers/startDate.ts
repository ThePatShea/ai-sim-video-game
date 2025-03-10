import Location from "../interfaces/location";

const startDate = (
  setDateStatus: (status: string) => void,
  setInputValue: (value: string) => void,
  setActiveView: (view: string) => void,
  activeLocation: Location,
  soundRef: any
) => {
  const locationSoundRef = soundRef.locations[activeLocation.id].ref;

  if (locationSoundRef.current) {
    locationSoundRef.current.pause();
    locationSoundRef.current.currentTime = 0;
  }

  soundRef.menus.date.ref.current?.play();

  setDateStatus("starting");
  setActiveView("map");
  setInputValue("");
};

export default startDate;
