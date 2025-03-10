import Image from "next/image";
import React, { useState, useEffect } from "react";

import thousandSeparator from "../helpers/thousandSeparator";

import Item from "../interfaces/item";

interface ItemCardProps {
  setActiveStoreItem: (item: Item | null) => void;
  setActivePopup: (popup: string) => void;
  item: Item;
}

const CharacterCard: React.FC<ItemCardProps> = ({
  item,
  setActiveStoreItem,
  setActivePopup,
}) => {
  const selectCurrentStoreItem = () => {
    setActiveStoreItem(item);
    setActivePopup("storeItem");
  };

  return (
    <div className="relative bg-indigo-100 mx-8 rounded-lg border-2 border-indigo-950 overflow-hidden shadow-lg active:shadow-none">
      <button
        className="hover:opacity-80"
        style={{
          width: 375,
          height: 375,
        }}
        onClick={() => selectCurrentStoreItem()}
      >
        <Image
          src={item.image}
          width={4096}
          height={4096}
          alt="Item"
          className="absolute top-0"
          style={{
            height: "100%",
            width: "100%",
            pointerEvents: "none",
          }}
        />
        <div className="absolute bottom-0 w-full text-center font-light bg-indigo-950 border-t-2 border-indigo-950 bg-opacity-70 pt-1 pb-2">
          <div className="text-3xl text-white" style={{ lineHeight: "100%" }}>
            {item.name}
          </div>
          <div
            className="text-lg text-indigo-200"
            style={{ lineHeight: "100%" }}
          >
            ${thousandSeparator(item.price)}
          </div>
        </div>
      </button>
    </div>
  );
};

export default CharacterCard;
