// src/hooks/useVariableScopes.js
import { useContext, useMemo } from 'react';
import { EnvironmentsContext } from '../../contexts/Environments';
import { WorkspacesContext } from '../../contexts/Workspaces';
import { GlobalVariablesContext } from '../../contexts/GlobalVariables';

export function useVariableScopes(localVarsArray) {
  const { currentWorkspaceId } = useContext(WorkspacesContext);
  const { environments, activeEnvironmentId } = useContext(EnvironmentsContext);
  const { globals } = useContext(GlobalVariablesContext);

  // ✅ Get the current environment list for dependency tracking
  const currentEnvList = environments[currentWorkspaceId] || [];

  return useMemo(() => {
    console.log('🔄 useVariableScopes recalculating...');
    console.log('  - currentWorkspaceId:', currentWorkspaceId);
    console.log('  - activeEnvironmentId:', activeEnvironmentId);

    const globalVars = Object.fromEntries(
      (globals || []).map(v => [v.key, v.value])
    );

    const localVars =
      Array.isArray(localVarsArray)
        ? Object.fromEntries(
            localVarsArray
              .filter(v => v.key?.trim())
              .map(v => [v.key, v.value])
          )
        : {};

    if (!activeEnvironmentId) {
      console.log('  ⚠️ No active environment');
      console.log('  ✅ Final scopes:', { localVars, envVars: {}, globalVars });
      return { localVars, envVars: {}, globalVars };
    }

    const activeEnv = currentEnvList.find(e => e.id === activeEnvironmentId);

    console.log('  - envList length:', currentEnvList.length);
    console.log('  - activeEnv found:', activeEnv?.name);
    console.log('  - activeEnv variables:', activeEnv?.variables);

    const envVars = activeEnv
      ? Object.fromEntries(
          (activeEnv.variables || []).map(v => [v.key, v.value])
        )
      : {};

    console.log('  ✅ Final scopes:', { localVars, envVars, globalVars });

    return { localVars, envVars, globalVars };
  }, [
    activeEnvironmentId,
    currentWorkspaceId,
    currentEnvList,
    localVarsArray,
    globals
  ]);
}