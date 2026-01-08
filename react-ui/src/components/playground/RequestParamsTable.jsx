import { useContext, useEffect, useState, Fragment } from 'react';
import { Context } from '../../contexts/Store';
import styles from './playground.module.css';
import style from './authHeader.module.css';

const RequestParamsTable = () => {
  const { state, dispatch } = useContext(Context);

  const [inputList, setInputList] = useState([
    { keyName: '', value: '', desc: '', selected: true },
  ]);

  // URL → Params
  useEffect(() => {
    if (!state.formData?.url) {
      setInputList([{ keyName: '', value: '', desc: '', selected: true }]);
      return;
    }

    try {
      const urlObj = new URL(state.formData.url);
      const params = Array.from(urlObj.searchParams.entries()).map(
        ([key, value]) => ({
          keyName: key,
          value,
          desc: '',
          selected: true,
        })
      );
      setInputList(
        params.length ? params : [{ keyName: '', value: '', desc: '', selected: true }]
      );
    } catch {
      // ignore invalid URL
    }
  }, [state.formData?.url]);

  const updateParams = (list) => {
    setInputList(list);
    const params = list
      .filter((p) => p.selected && p.keyName)
      .map((p) => ({ key: p.keyName, value: p.value }));

    dispatch({ type: 'SET_QPARAMS', payload: params });
  };

  const handleChange = (e, index) => {
    const { name, value, checked } = e.target;
    const list = [...inputList];
    list[index][name] = name === 'selected' ? checked : value;
    updateParams(list);
  };

  const handleRemove = (i) => {
    const list = inputList.filter((_, idx) => idx !== i);
    updateParams(
      list.length ? list : [{ keyName: '', value: '', desc: '', selected: true }]
    );
  };

  const handleAdd = () => {
    updateParams([
      ...inputList,
      { keyName: '', value: '', desc: '', selected: true },
    ]);
  };

  return (
    <div
      className={
        state.splitView === 'H' ? styles.payload_wrapper : styles.payload_wrapper_full
      }
    >
      <table className={styles.qp_table}>
        <caption>Query Params</caption>
        <thead>
          <tr>
            <th></th>
            <th>KEY</th>
            <th>VALUE</th>
            <th>DESCRIPTION</th>
          </tr>
        </thead>
        <tbody>
          {inputList.map((x, i) => (
            <Fragment key={i}>
              <tr>
                <td>
                  <input
                    type="checkbox"
                    name="selected"
                    checked={x.selected}
                    onChange={(e) => handleChange(e, i)}
                  />
                </td>
                <td>
                  <input
                    name="keyName"
                    value={x.keyName}
                    onChange={(e) => handleChange(e, i)}
                    placeholder="Key"
                    spellCheck={false}
                    autoComplete="off"
                  />
                </td>
                <td>
                  <input
                    name="value"
                    value={x.value}
                    onChange={(e) => handleChange(e, i)}
                    placeholder="Value"
                    spellCheck={false}
                    autoComplete="off"
                  />
                </td>
                <td>
                  <input
                    name="desc"
                    value={x.desc}
                    onChange={(e) => handleChange(e, i)}
                    placeholder="Description"
                  />
                  {inputList.length > 1 && (
                    <span onClick={() => handleRemove(i)}>&times;</span>
                  )}
                </td>
              </tr>

              {i === inputList.length - 1 && (
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

export default RequestParamsTable;
