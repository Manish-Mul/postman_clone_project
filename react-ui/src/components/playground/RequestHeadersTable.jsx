import { useContext, useState, useEffect, Fragment } from 'react';
import { Context } from '../../contexts/Store';
import { WorkspacesContext } from '../../contexts/Workspaces';
import { EnvironmentsContext } from '../../contexts/Environments';
import { useVariableScopes } from '../hooks/useVariableScopes';
import { interpolateString } from '../../utils/variables';
import styles from './playground.module.css';
import style from './authHeader.module.css';

const RequestHeadersTable = ({ localVars }) => {
  const { state, dispatch } = useContext(Context);
  const { currentWorkspaceId } = useContext(WorkspacesContext);
  const { activeEnvironmentId } = useContext(EnvironmentsContext);
  const scopesFromHook = useVariableScopes(localVars);

  const [authHeader] = useState(() => {
    if (state.authLocation === 'header') {
      const header = state.authHeader.split(':');
      if (header.length === 2) {
        return { keyName: header[0], value: header[1], selected: true };
      }
    }
    return null;
  });

  const [inputList, setInputList] = useState(() => {
    if (state.requestHeaders.length) {
      return state.requestHeaders.map((header) => ({
        keyName: header.key,
        value: header.value,
        selected: true,
      }));
    } else {
      return [{ keyName: '', value: '', selected: true }];
    }
  });

  // ✅ Calculate interpolated previews for all headers
  const [previews, setPreviews] = useState({});

  useEffect(() => {
    const localVarsMap = Object.fromEntries(
      (localVars || []).filter((v) => v.key?.trim()).map((v) => [v.key, v.value])
    );
    const finalScopes = { ...scopesFromHook, localVars: localVarsMap };

    const newPreviews = {};
    inputList.forEach((header, index) => {
      if (header.value && typeof header.value === 'string') {
        const interpolated = interpolateString(header.value, finalScopes);
        // Only store if different from original
        if (interpolated !== header.value) {
          newPreviews[index] = interpolated;
        }
      }
    });

    setPreviews(newPreviews);
  }, [inputList, scopesFromHook, localVars, activeEnvironmentId]);

  useEffect(() => {
    if (state.requestHeaders.length) {
      setInputList(
        state.requestHeaders.map(h => ({
          keyName: h.key,
          value: h.value,
          selected: true,
        }))
      );
    }
  }, [state.requestHeaders]);

  const handleInputChange = (e, index) => {
    const { name, value, checked } = e.target;
    const list = [...inputList];
    list[index][name] = name === 'selected' ? checked : value;
    setInputList(list);
    getHeaders(list);
  };

  const handleRemoveClick = (index) => {
    const list = [...inputList];
    list.splice(index, 1);
    setInputList(() => list);
    getHeaders(list);
  };

  const handleAddClick = () => {
    setInputList([...inputList, { keyName: '', value: '', selected: true }]);
  };

  const getHeaders = (list) => {
    const headers = list
      .filter((header) => header.selected && header.keyName !== '')
      .map((header) => ({ key: header.keyName, value: header.value }));
    console.log('🧪 Dispatching headers:', headers);
    dispatch({ type: 'SET_REQUEST_HEADERS', payload: headers });
  };

  return (
    <div
      className={
        state.responsePanelMinimized || state.splitView === 'V'
          ? styles.payload_wrapper_full
          : styles.payload_wrapper
      }
      style={{ borderColor: 'transparent' }}
    >
      <table
        className={
          state.splitView === 'H' ? style.qp_table : style.qp_table_small
        }
      >
        <caption>Headers</caption>
        <thead>
          <tr>
            <th></th>
            <th>KEY</th>
            <th>VALUE</th>
            <th>
              <span>DESCRIPTION</span>
              <span className={styles.qp_options}>
                <span>
                  <i className="feather-more-horizontal"></i>
                </span>
                <span>Bulk Edit</span>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {authHeader && (
            <tr>
              <td>
                <input type="checkbox" name="selected" checked disabled />
              </td>
              <td>
                <input
                  type="text"
                  placeholder="Key"
                  name="keyName"
                  value={authHeader.keyName}
                  readOnly
                />
              </td>
              <td>
                <input
                  type="text"
                  placeholder="Value"
                  name="value"
                  value={authHeader.value}
                  readOnly
                />
              </td>
              <td>
                <input
                  type="text"
                  value="Added automatically from authorization."
                  placeholder="Description"
                  disabled
                />
              </td>
            </tr>
          )}
          {inputList.map((x, i) => (
            <Fragment key={`reqh-row-group-${i}`}>
              <tr>
                <td>
                  <input
                    type="checkbox"
                    name="selected"
                    checked={x.selected}
                    onChange={(e) => handleInputChange(e, i)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    placeholder="Key"
                    name="keyName"
                    value={x.keyName}
                    onChange={(e) => handleInputChange(e, i)}
                    spellCheck={false}
                    autoComplete="off"
                  />
                </td>
                <td>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input
                      type="text"
                      placeholder="Value"
                      name="value"
                      value={x.value}
                      onChange={(e) => handleInputChange(e, i)}
                      spellCheck={false}
                      autoComplete="off"
                      style={{ width: '100%' }}
                    />
                    {/* ✅ Show preview if value contains variables */}
                    {previews[i] && (
                      <div style={{
                        fontSize: '11px',
                        color: '#4CAF50',
                        marginTop: '2px',
                        padding: '2px 4px',
                        background: '#f0f9ff',
                        borderRadius: '3px',
                        border: '1px solid #e0f2fe',
                        fontFamily: 'monospace',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        <span style={{ color: '#888', fontWeight: '600' }}>Preview:</span> {previews[i]}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <input type="text" placeholder="Description" />
                  {inputList.length !== 1 && (
                    <span onClick={() => handleRemoveClick(i)}>&times;</span>
                  )}
                </td>
              </tr>

              {inputList.length - 1 === i && (
                <tr key="reqh-new-input-x">
                  <td colSpan={4} className={styles.add_td}>
                    <button onClick={handleAddClick}>
                      <i className="feather-plus"></i>
                    </button>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RequestHeadersTable;