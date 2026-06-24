"use client";

import React, { useState } from "react";
import Drawer from "./Drawer";

export function ClientDrawerWrapper({
  trigger,
  title,
  description,
  content
}: {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  content: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)} 
        className="cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-md rounded-2xl"
      >
        {trigger}
      </div>
      
      <Drawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
        description={description}
        side="right"
        width="lg"
      >
        <div className="p-6">
          {content}
        </div>
      </Drawer>
    </>
  );
}
