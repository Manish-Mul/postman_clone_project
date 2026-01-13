import { useContext } from 'react';
import { EnvironmentsContext } from '../../contexts/Environments';
import { WorkspacesContext } from '../../contexts/Workspaces';

const EnvironmentSelector = () => {
  const { environments, activeEnvironmentId, setActiveEnvironmentId } = useContext(EnvironmentsContext);
  const { currentWorkspaceId } = useContext(WorkspacesContext);

  const currentEnvironments = environments[currentWorkspaceId] || [];

  const handleChange = (e) => {
    const value = e.target.value;
    const id = value === '' ? null : Number(value);
    setActiveEnvironmentId(id);
    console.log('🔄 Environment changed to:', id);
  };

  if (currentEnvironments.length === 0) {
    return (
      <div style={{
        padding: '6px 12px',
        fontSize: '13px',
        color: '#999',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        background: '#f9f9f9',
        cursor: 'not-allowed',
        minWidth: '150px',
        textAlign: 'center'
      }}>
        No Environments
      </div>
    );
  }

  const activeEnv = currentEnvironments.find(env => env.id === activeEnvironmentId);

  return (
    <div style={{ position: 'relative' }}>
      <select
        value={activeEnvironmentId ?? ''}
        onChange={handleChange}
        style={{
          padding: '6px 32px 6px 12px',
          fontSize: '13px',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          background: '#fff',
          cursor: 'pointer',
          minWidth: '180px',
          outline: 'none',
          appearance: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
        }}
        title={activeEnv ? `Active: ${activeEnv.name}` : 'Select an environment'}
      >
        <option value="">No Environment</option>
        {currentEnvironments.map((env) => (
          <option key={env.id} value={env.id}>
            {env.name}
          </option>
        ))}
      </select>
      
      {/* Custom dropdown arrow */}
      <div style={{
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        pointerEvents: 'none',
        fontSize: '10px',
        color: '#666'
      }}>
        ▼
      </div>
      
      {/* Active indicator */}
      {activeEnvironmentId && (
        <div style={{
          position: 'absolute',
          left: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: '#4CAF50',
          pointerEvents: 'none'
        }} />
      )}
    </div>
  );
};

export default EnvironmentSelector;