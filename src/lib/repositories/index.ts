// Export all repositories
export * from './user-repository';
export * from './project-repository';
export * from './expense-repository';
export * from './task-repository';
export * from './file-repository';
export * from './note-repository';

// Export the base repository for extension
export * from './base-repository';

// Export the repository factory
export * from './repository-factory';

// Import repositories for creating cached versions
import { userRepository } from './user-repository';
import { projectRepository } from './project-repository';
import { expenseRepository } from './expense-repository';
import { taskRepository } from './task-repository';
import { fileRepository } from './file-repository';
import { noteRepository } from './note-repository';
import { RepositoryFactory } from './repository-factory';

// Create cached repositories
export const cachedUserRepository = RepositoryFactory.createCached(
  userRepository,
  'user',
  300 // 5 minutes cache
);

export const cachedProjectRepository = RepositoryFactory.createCached(
  projectRepository,
  'project',
  300 // 5 minutes cache
);

export const cachedExpenseRepository = RepositoryFactory.createCached(
  expenseRepository,
  'expense',
  300 // 5 minutes cache
);

export const cachedTaskRepository = RepositoryFactory.createCached(
  taskRepository,
  'task',
  300 // 5 minutes cache
);

export const cachedFileRepository = RepositoryFactory.createCached(
  fileRepository,
  'file',
  300 // 5 minutes cache
);

export const cachedNoteRepository = RepositoryFactory.createCached(
  noteRepository,
  'note',
  300 // 5 minutes cache
);