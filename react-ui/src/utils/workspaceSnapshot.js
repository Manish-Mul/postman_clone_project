export function buildWorkspaceSnapshot({
  workspacesState,
  collectionsState,
  environmentsState,
  historyState,
}) {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    workspaces: workspacesState,     // whatever your reducers store
    collections: collectionsState,
    environments: environmentsState,
    history: historyState,
  };
}
