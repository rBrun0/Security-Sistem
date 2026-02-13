"use client";

import { useState } from "react";
import { Envoriments } from "./enviroments";
import { FormDialog } from "./formDialog";

export const Content = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Ambientes (Obras)
          </h1>
          <p className="text-slate-500 mt-1">
            Gerencie os ambientes de trabalho
          </p>
        </div>
        <FormDialog isOpen={isOpen} setIsOpen={setIsOpen} />
      </div>
      <Envoriments isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
};
