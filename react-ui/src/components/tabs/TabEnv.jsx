import { useContext, useState, useMemo } from 'react';
import styles from './tab.module.css';
import image from '../../images/no-env.png';
import { EnvironmentsContext } from '../../contexts/Environments';
import { Context } from '../../contexts/Store';

const TabEnv = () => {
  const { environments, createEnvironment, updateEnvironment, deleteEnvironment } = useContext(EnvironmentsContext);
  const { state } = useContext(Context);


  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [newEnvName, setNewEnvName] = useState('');
  const [variables, setVariables] = useState([{ key: '', value: '' }]);

  // Only one useMemo for currentEnvironments
  const currentEnvironments = useMemo(() => {
    return environments[state.currentWorkspaceId] || [];
  }, [environments, state.currentWorkspaceId]);

  // Use createEnvironment from context (database-backed)
  const handleCreate = async () => {
    if (!newEnvName.trim()) return;

    const validVariables = variables.filter(v => v.key.trim());

    try {
      await createEnvironment(state.currentWorkspaceId, newEnvName.trim(), validVariables);

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
    setVariables(env.variables.length ? env.variables : [{ key: '', value: '' }]);
  };

  // Use updateEnvironment from context (database-backed)
  const handleUpdate = async () => {
    if (!newEnvName.trim()) return;

    const validVariables = variables.filter(v => v.key.trim());

    try {
      await updateEnvironment(state.currentWorkspaceId, editing, newEnvName.trim(), validVariables);

      setEditing(null);
      setNewEnvName('');
      setVariables([{ key: '', value: '' }]);
    } catch (err) {
      alert('Failed to update environment');
    }
  };

  // Use deleteEnvironment from context (database-backed)
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this environment?')) return;

    try {
      await deleteEnvironment(state.currentWorkspaceId, id);
    } catch (err) {
      alert('Failed to delete environment');
    }
  };

  const addVariable = () => {
    setVariables([...variables, { key: '', value: '' }]);
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
    <div style={{ 
      padding: '1rem', 
      height: '100%',
      overflowY: 'auto',
      maxHeight: 'calc(100vh - 200px)'
    }}>
      <div style={{ 
        marginBottom: 16, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        background: 'var(--panel-bg)',
        zIndex: 10,
        paddingBottom: 8
      }}>
        <h4 style={{ margin: 0 }}>Environments</h4>
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

      {/* Environment List */}
      {!creating && !editing && currentEnvironments.map(env => (
        <div
          key={env.id}
          style={{
            background: 'var(--panel-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: 6,
            padding: 12,
            marginBottom: 12,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{env.name}</strong>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                {env.variables.length} variable(s)
              </div>
            </div>
            <div>
              <button
                onClick={() => handleEdit(env)}
                style={{ marginRight: 8, background: 'none', border: 'none', cursor: 'pointer' }}
                title="Edit"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDelete(env.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Create/Edit Form */}
      {(creating || editing) && (
        <div style={{ 
          background: 'var(--panel-bg)', 
          border: '1px solid var(--border-color)', 
          borderRadius: 6, 
          padding: 16,
          maxWidth: '100%'
        }}>
          <h4 style={{ marginTop: 0 }}>{editing ? 'Edit Environment' : 'Create Environment'}</h4>
          
          <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
            Environment Name
          </label>
          <input
            value={newEnvName}
            onChange={e => setNewEnvName(e.target.value)}
            placeholder="e.g., Production"
            style={{ 
              width: '100%', 
              padding: 8, 
              marginBottom: 16, 
              borderRadius: 4, 
              border: '1px solid var(--border-color)',
              boxSizing: 'border-box'
            }}
          />

          <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
            Variables
          </label>
          
          <div style={{ 
            maxHeight: '300px', 
            overflowY: 'auto',
            marginBottom: 12 
          }}>
            {variables.map((variable, idx) => (
              <div key={idx} style={{ 
                display: 'flex', 
                gap: 6, 
                marginBottom: 8,
                alignItems: 'center'
              }}>
                <input
                  placeholder="Key"
                  value={variable.key}
                  onChange={e => updateVariable(idx, 'key', e.target.value)}
                  style={{ 
                    flex: 1, 
                    padding: 8, 
                    borderRadius: 4, 
                    border: '1px solid var(--border-color)',
                    fontSize: 13,
                    minWidth: 0
                  }}
                />
                <input
                  placeholder="Value"
                  value={variable.value}
                  onChange={e => updateVariable(idx, 'value', e.target.value)}
                  style={{ 
                    flex: 1, 
                    padding: 8, 
                    borderRadius: 4, 
                    border: '1px solid var(--border-color)',
                    fontSize: 13,
                    minWidth: 0
                  }}
                />
                <button
                  onClick={() => removeVariable(idx)}
                  style={{ 
                    padding: '6px 10px',
                    background: '#e74c3c', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: 4, 
                    cursor: 'pointer',
                    fontSize: 12,
                    flexShrink: 0
                  }}
                >
                  ✖
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addVariable}
            style={{ 
              padding: '6px 12px', 
              background: 'var(--secondary-bg)', 
              border: '1px solid var(--border-color)', 
              borderRadius: 4, 
              cursor: 'pointer', 
              marginBottom: 16,
              fontSize: 13
            }}
          >
            + Add Variable
          </button>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={editing ? handleUpdate : handleCreate}
              style={{ 
                padding: '8px 16px', 
                background: 'var(--theme-color)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 4, 
                cursor: 'pointer',
                fontSize: 14
              }}
            >
              {editing ? 'Update' : 'Create'}
            </button>
            <button
              onClick={() => {
                setCreating(false);
                setEditing(null);
                setNewEnvName('');
                setVariables([{ key: '', value: '' }]);
              }}
              style={{ 
                padding: '8px 16px', 
                background: 'transparent', 
                border: '1px solid var(--border-color)', 
                borderRadius: 4, 
                cursor: 'pointer',
                fontSize: 14
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabEnv;
