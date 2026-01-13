// utils/variables.js
export function resolveVariable(name, { localVars, envVars, globalVars }) {
  if (localVars && name in localVars) return localVars[name];
  if (envVars && name in envVars) return envVars[name];
  if (globalVars && name in globalVars) return globalVars[name];
  return undefined;
}

const VAR_REGEX = /\{\{([\w.-]+)\}\}/g; // supports a.b, a-b, a_b [web:637]

export function interpolateString(str, scopes) {
  if (typeof str !== 'string') return str;
  return str.replace(VAR_REGEX, (_, name) => {
    const value = resolveVariable(name, scopes);
    return value != null ? String(value) : '';
  });
}
