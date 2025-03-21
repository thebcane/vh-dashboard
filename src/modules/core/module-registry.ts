"use client";

import { Module } from "@/types/module";

class ModuleRegistry {
  private modules: Map<string, Module> = new Map();
  private static instance: ModuleRegistry;

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): ModuleRegistry {
    if (!ModuleRegistry.instance) {
      ModuleRegistry.instance = new ModuleRegistry();
    }
    return ModuleRegistry.instance;
  }

  public registerModule(module: Module): void {
    if (this.modules.has(module.id)) {
      console.warn(`Module with ID ${module.id} is already registered. Overwriting.`);
    }
    this.modules.set(module.id, module);
  }

  public getModule(id: string): Module | undefined {
    return this.modules.get(id);
  }

  public getAllModules(): Module[] {
    return Array.from(this.modules.values());
  }

  public getEnabledModules(): Module[] {
    return this.getAllModules().filter(module => module.enabled);
  }

  public getAllNavItems() {
    return this.getEnabledModules().flatMap(module => module.navItems);
  }

  public getAllWidgets() {
    return this.getEnabledModules()
      .flatMap(module => module.widgets || [])
      .sort((a, b) => a.priority - b.priority);
  }

  public toggleModuleStatus(id: string, enabled: boolean): boolean {
    const mod = this.modules.get(id);
    if (!mod) return false;
    
    const updatedModule = { ...mod, enabled };
    this.modules.set(id, updatedModule);
    return true;
  }

  public initializeAllModules = async (): Promise<void> => {
    for (const mod of this.getEnabledModules()) {
      if (mod.initialize) {
        try {
          await mod.initialize();
        } catch (error) {
          console.error(`Failed to initialize module ${mod.id}:`, error);
        }
      }
    }
  };
}

// Export as singleton
export const moduleRegistry = ModuleRegistry.getInstance();