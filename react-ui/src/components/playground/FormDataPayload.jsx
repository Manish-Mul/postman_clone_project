// FormDataPayload.jsx
import { useContext, useEffect, useState, Fragment } from 'react';
import { Context } from '../../contexts/Store';
import styles from './playground.module.css';

const FormDataPayload = () => {
  const { state, dispatch } = useContext(Context);

  const rows = state.formData?.formDataRows || [
    { key: '', value: '', type: 'text', selected: true },
  ];

  const sync = (list) => {
    const safe = list.length ? list : [{ key: '', value: '', type: 'text', selected: true }];
    dispatch({ type: 'SET_FORMDATA_ROWS', payload: safe });
  };

  const handleChange = (e, i) => {
    const { name, value, checked, files, type } = e.target;
    const list = [...rows];

    if (name === 'selected') {
      list[i].selected = checked;
    } else if (name === 'type') {
      list[i].type = value;
      if (value === 'file') list[i].value = null;
    } else if (type === 'file') {
      list[i].value = files[0] || null;
    } else {
      list[i][name] = value;
    }

    sync(list);
  };

  const handleRemove = (i) => {
    const list = rows.filter((_, idx) => idx !== i);
    sync(list);
  };

  const handleAdd = () => {
    sync([
      ...rows,
      { key: '', value: '', type: 'text', selected: true },
    ]);
  };

  return (
    <div className={styles.payload_wrapper}>
      <table className={styles.qp_table}>
        <caption>form-data</caption>
        <thead>
          <tr>
            <th></th>
            <th>KEY</th>
            <th>VALUE</th>
            <th>TYPE</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <Fragment key={i}>
              <tr>
                <td>
                  <input
                    type="checkbox"
                    name="selected"
                    checked={r.selected ?? true}
                    onChange={(e) => handleChange(e, i)}
                  />
                </td>
                <td>
                  <input
                    name="key"
                    placeholder="Key"
                    value={r.key || ''}
                    onChange={(e) => handleChange(e, i)}
                    spellCheck={false}
                    autoComplete="off"
                  />
                </td>
                <td>
                  {r.type === 'file' ? (
                    <input
                      type="file"
                      name="value"
                      onChange={(e) => handleChange(e, i)}
                    />
                  ) : (
                    <input
                      name="value"
                      placeholder="Value"
                      value={r.value || ''}
                      onChange={(e) => handleChange(e, i)}
                      spellCheck={false}
                      autoComplete="off"
                    />
                  )}
                </td>
                <td>
                  <select
                    name="type"
                    value={r.type}
                    onChange={(e) => handleChange(e, i)}
                  >
                    <option value="text">Text</option>
                    <option value="file">File</option>
                  </select>
                  {rows.length > 1 && (
                    <span onClick={() => handleRemove(i)}>&times;</span>
                  )}
                </td>
              </tr>

              {i === rows.length - 1 && (
                <tr>
                  <td colSpan={4} className={styles.add_td}>
                    <button type="button" onClick={handleAdd}>
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


export default FormDataPayload;
