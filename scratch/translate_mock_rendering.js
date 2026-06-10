import fs from 'fs';

const filePath = "c:\\Users\\pc\\Downloads\\remix_-quản-lý-công-việc-trường-học\\src\\App.tsx";
let content = fs.readFileSync(filePath, 'utf8');

// Normalize CRLFs
let normalizedContent = content.replace(/\r\n/g, '\n');

// 1. Add import for mappers at the top
const importTarget = `import { useLanguage } from './context/LanguageContext';`;
const importReplacement = `import { useLanguage } from './context/LanguageContext';\nimport { translateWorkspace, translateUser, translateTask, translateAnnouncement, translateDirective } from './utils/translations';`;

if (normalizedContent.includes(importTarget)) {
    normalizedContent = normalizedContent.replace(importTarget, importReplacement);
    console.log("Import block updated correctly!");
}

// 2. Wrap roleFilteredTasks and visibleWorkspaces with translation mappers
const tasksTarget = `  const roleFilteredTasks = getTasksByRoleLimit();`;
const tasksReplacement = `  const roleFilteredTasks = getTasksByRoleLimit().map(t => translateTask(t, lang));`;

if (normalizedContent.includes(tasksTarget)) {
    normalizedContent = normalizedContent.replace(tasksTarget, tasksReplacement);
    console.log("roleFilteredTasks mapping updated!");
}

const workspacesTarget = `  const visibleWorkspaces = currentUser?.role === 'STAFF'
    ? workspaces.filter(w => w.id === currentUser.workspaceId)
    : workspaces;`;
const workspacesReplacement = `  const visibleWorkspaces = (currentUser?.role === 'STAFF'
    ? workspaces.filter(w => w.id === currentUser.workspaceId)
    : workspaces).map(w => translateWorkspace(w, lang));`;

if (normalizedContent.includes(workspacesTarget)) {
    normalizedContent = normalizedContent.replace(workspacesTarget, workspacesReplacement);
    console.log("visibleWorkspaces mapping updated!");
}

// 3. Shadow announcements and directives at render time for easy translation
const shadowTarget = `  // Current active Workspace metadata
  const activeWorkspaceMeta = visibleWorkspaces.find(w => w.id === selectedWorkspace) || visibleWorkspaces[0];`;

const shadowReplacement = `  // Shadow state variables for display translation
  const displayAnnouncements = announcements.map(a => translateAnnouncement(a, lang));
  const displayDirectives = directives.map(d => translateDirective(d, lang));
  const displayUsers = users.map(u => translateUser(u, lang));
  const displayCurrentUser = translateUser(currentUser, lang);

  // Current active Workspace metadata
  const activeWorkspaceMeta = visibleWorkspaces.find(w => w.id === selectedWorkspace) || visibleWorkspaces[0];`;

if (normalizedContent.includes(shadowTarget)) {
    normalizedContent = normalizedContent.replace(shadowTarget, shadowReplacement);
    console.log("Shadow variables created!");
}

// 4. In App.tsx, replace references of props
const propReplacements = [
    [`users={users}`, `users={displayUsers}`],
    [`currentUser={currentUser}`, `currentUser={displayCurrentUser}`],
    [`initialUser={currentUser}`, `initialUser={displayCurrentUser}`],
    [`announcements.map`, `displayAnnouncements.map`],
    [`directives.map`, `displayDirectives.map`],
    [`currentUser.name`, `displayCurrentUser.name`],
    [`currentUser.title`, `displayCurrentUser.title`],
    [`currentUser.roleName`, `displayCurrentUser.roleName`]
];

for (const [target, replacement] of propReplacements) {
    const regex = new RegExp(target.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
    normalizedContent = normalizedContent.replace(regex, replacement);
}
console.log("Rendering props and currentUser references updated!");

fs.writeFileSync(filePath, normalizedContent, 'utf8');
console.log("Process completed successfully!");
