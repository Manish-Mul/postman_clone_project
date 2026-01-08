import { useContext, useEffect, useState } from 'react';
import AceEditor from 'react-ace';
import ace from 'ace-builds/src-noconflict/ace';

import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-tomorrow';
import 'ace-builds/src-noconflict/theme-twilight';

import { Context } from '../../contexts/Store';

ace.config.set('useWorker', false); // 👈 disable worker

const RawPayload = () => {
  const { state, dispatch } = useContext(Context);
  const [dark, setDark] = useState(false);
  const [input, setInput] = useState(state.formData.payload || '');

  useEffect(() => {
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      setDark(true);
    }
  }, []);

  useEffect(() => {
    setInput(state.formData.payload || '');
  }, [state.formData.payload]);

  const handleChange = (val) => {
    setInput(val);
    dispatch({ type: 'SET_PAYLOAD', payload: val });
  };

  return (
    <AceEditor
      mode="json"
      theme={dark ? 'twilight' : 'tomorrow'}
      value={input}
      onChange={handleChange}
      name="rawPayloadInput"
      width="100%"
      height="200px"
      fontSize={13}
      tabSize={2}
      setOptions={{
        useWorker: false, // 👈 also disable here
        showLineNumbers: true,
        wrap: true,
      }}
    />
  );
};

export default RawPayload;
