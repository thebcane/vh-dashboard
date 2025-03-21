"use client";

import { useEffect, useState } from "react";
import { moduleRegistry } from "./module-registry";

// Import all modules
import "../projects";
import "../expenses";
import "../brainstorm";
import "../files";
import "../calendar";
// Future modules will be imported here
// import "../messages";

export function ModuleLoader() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!initialized) {
        try {
          await moduleRegistry.initializeAllModules();
          setInitialized(true);
          console.log("All modules initialized");
        } catch (error) {
          console.error("Error initializing modules:", error);
        }
      }
    };

    init();
  }, [initialized]);

  return null; // This component doesn't render anything
}