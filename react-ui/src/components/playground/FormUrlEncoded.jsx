// FormUrlEncoded.jsx
import { useContext, useEffect, useState, Fragment } from 'react';
import { Context } from '../../contexts/Store';
import styles from './playground.module.css';

const FormUrlEncoded = () => {
  const { state, dispatch } = useContext(Context);

  const rows = state.formData?.urlEncodedRows || [
    { key: '', value: '', selected: true },
  ];

  const sync = (list) => {
    // always array of { key, value, selected }
    dispatch({
      type: 'SET_FORM_URLENCODED',
      payload: list.length ? list : [{ key: '', value: '', selected: true }],
    });
  };

  const handleChange = (e, i) => {
    const { name, value, checked } = e.target;
    const list = [...rows];

    if (name === 'selected') {
      list[i].selected = checked;
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
      { key: '', value: '', selected: true },
    ]);
  };

  return (
    <div className={styles.payload_wrapper}>
      <table className={styles.qp_table}>
        <caption>x-www-form-urlencoded</caption>
        <thead>
          <tr>
            <th></th>
            <th>KEY</th>
            <th>VALUE</th>
            <th>DESCRIPTION</th>
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
                  <input
                    name="value"
                    placeholder="Value"
                    value={r.value || ''}
                    onChange={(e) => handleChange(e, i)}
                    spellCheck={false}
                    autoComplete="off"
                  />
                </td>
                <td>
                  {/* description is purely visual; omit from Redux */}
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

export default FormUrlEncoded;
