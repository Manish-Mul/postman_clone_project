import { useContext, useState, useMemo } from 'react';
import styles from './tab.module.css';
import image from '../../images/no-env.png';
import { EnvironmentsContext } from '../../contexts/Environments';
import { Context } from '../../contexts/Store';
import { WorkspacesContext } from '../../contexts/Workspaces';

const TabEnv = () => {
  const {
    environments,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
    activeEnvironmentId,
    setActiveEnvironmentId
  } = useContext(EnvironmentsContext);

  const { state } = useContext(Context);
  const { currentWorkspaceId } = useContext(WorkspacesContext);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [newEnvName, setNewEnvName] = useState('');
  const [variables, setVariables] = useState([{ key: '', value: '', isSecret: false }]);

  // Get environments for current workspace
  const currentEnvironments = useMemo(
    () => environments[currentWorkspaceId] || [],
    [environments, currentWorkspaceId]
  );

  console.log('TabEnv - Active Environment ID:', activeEnvironmentId);
  console.log('TabEnv - Current Environments:', currentEnvironments);

  const handleCreate = async () => {
    if (!newEnvName.trim()) return;

    const validVariables = variables.filter(v => v.key.trim());

    try {
      await createEnvironment(currentWorkspaceId, newEnvName.trim(), validVariables);

      setNewEnvName('');
      setVariables([{ key: '', value: '' }]);
      setCreating(false);
    } catch (err) {
      alert('Failed to create environment');
    }
  };

  const handleEdit = (env) => {
    setEditing(env.id);
    setNewEnvName(env.name);
    setVariables(
      env.variables.length
        ? env.variables.map(v => ({ ...v, isSecret: !!v.isSecret }))
        : [{ key: '', value: '', isSecret: false }]
    );
  };

  const handleUpdate = async () => {
    if (!newEnvName.trim()) return;

    const validVariables = variables.filter(v => v.key.trim());

    try {
      await updateEnvironment(currentWorkspaceId, editing, newEnvName.trim(), validVariables);

      setEditing(null);
      setNewEnvName('');
      setVariables([{ key: '', value: '' }]);
    } catch (err) {
      alert('Failed to update environment');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this environment?')) return;

    try {
      await deleteEnvironment(currentWorkspaceId, id);
    } catch (err) {
      alert('Failed to delete environment');
    }
  };

  const addVariable = () => {
    setVariables([...variables, { key: '', value: '', isSecret: false }]);
  };

  const updateVariable = (index, field, value) => {
    const updated = [...variables];
    updated[index][field] = value;
    setVariables(updated);
  };

  const removeVariable = (index) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  if (!creating && !editing && currentEnvironments.length === 0) {
    return (
      <div className={styles.empty_tab}>
        <img src={image} alt="No environments" />
        <h4>You don't have any environments.</h4>
        <p>
          An environment is a set of variables that allows you to switch the
          context of your requests.
        </p>
        <span onClick={() => setCreating(true)} style={{ cursor: 'pointer' }}>
          Create Environment
        </span>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', height: '100%', overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          background: 'var(--panel-bg)',
          zIndex: 10,
          paddingBottom: 8,
        }}
      >
        <h4 style={{ margin: 0 }}>Environments</h4>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>

          {!creating && !editing && (
            <button
              onClick={() => setCreating(true)}
              style={{
                padding: '6px 12px',
                background: 'var(--theme-color)',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              + New
            </button>
          )}
        </div>
      </div>

      {/* List existing environments */}
      {!creating && !editing && currentEnvironments.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {currentEnvironments.map((env) => (
            <div
              key={env.id}
              style={{
                padding: 12,
                border: '1px solid var(--border-color)',
                borderRadius: 6,
                background: activeEnvironmentId === env.id ? '#f0f9ff' : '#fff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <strong>{env.name}</strong>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleEdit(env)} style={{ fontSize: 12, padding: '4px 8px' }}>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(env.id)}
                    style={{ fontSize: 12, padding: '4px 8px', background: '#fee', color: '#c00' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              {env.variables && env.variables.length > 0 && (
                <div style={{ fontSize: 12, color: '#666' }}>
                  {env.variables.map((v, idx) => (
                    <div key={idx}>
                      <strong>{v.key}</strong>: {v.isSecret ? '••••••' : v.value}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit forms remain the same... */}
      {creating && (
        <div style={{ padding: 12, border: '1px solid var(--border-color)', borderRadius: 6 }}>
          <h5>Create Environment</h5>
          <input
            type="text"
            placeholder="Environment name"
            value={newEnvName}
            onChange={(e) => setNewEnvName(e.target.value)}
            style={{ width: '100%', padding: 8, marginBottom: 12 }}
          />
          <h6>Variables</h6>
          {variables.map((v, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                placeholder="Key"
                value={v.key}
                onChange={(e) => updateVariable(idx, 'key', e.target.value)}
                style={{ flex: 1, padding: 6 }}
              />
              <input
                type={v.isSecret ? 'password' : 'text'}
                placeholder="Value"
                value={v.value}
                onChange={(e) => updateVariable(idx, 'value', e.target.value)}
                style={{ flex: 1, padding: 6 }}
              />

              <label style={{ fontSize: 12 }}>
                <input
                  type="checkbox"
                  checked={v.isSecret || false}
                  onChange={(e) => updateVariable(idx, 'isSecret', e.target.checked)}
                /> Secret
              </label>

              <button onClick={() => removeVariable(idx)}>Remove</button>
            </div>
          ))}
          <button onClick={addVariable} style={{ marginBottom: 12 }}>
            + Add Variable
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleCreate}>Create</button>
            <button onClick={() => setCreating(false)}>Cancel</button>
          </div>
        </div>
      )}

      {editing && (
        <div style={{ padding: 12, border: '1px solid var(--border-color)', borderRadius: 6 }}>
          <h5>Edit Environment</h5>
          <input
            type="text"
            placeholder="Environment name"
            value={newEnvName}
            onChange={(e) => setNewEnvName(e.target.value)}
            style={{ width: '100%', padding: 8, marginBottom: 12 }}
          />
          <h6>Variables</h6>
          {variables.map((v, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                placeholder="Key"
                value={v.key}
                onChange={(e) => updateVariable(idx, 'key', e.target.value)}
                style={{ flex: 1, padding: 6 }}
              />
              <input
                placeholder="Value"
                value={v.value}
                onChange={(e) => updateVariable(idx, 'value', e.target.value)}
                style={{ flex: 1, padding: 6 }}
              />
              <button onClick={() => removeVariable(idx)}>Remove</button>
            </div>
          ))}
          <button onClick={addVariable} style={{ marginBottom: 12 }}>
            + Add Variable
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleUpdate}>Update</button>
            <button onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabEnv;