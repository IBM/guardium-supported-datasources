import { createContext, useContext, useState } from 'react';
import React from "react";


const TooltipContext = createContext();

export function TooltipProvider({ children }){
  const [openTooltipId, setOpenTooltipId] = useState(null); // e.g., 'link1', 'link2'

  return (
    <TooltipContext.Provider value={{ openTooltipId, setOpenTooltipId }}>
      {children}
    </TooltipContext.Provider>
  );
}

export const useTooltip = () => useContext(TooltipContext);