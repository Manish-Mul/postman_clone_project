import { useEffect, useState } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/theme-tomorrow';
import 'ace-builds/src-noconflict/theme-twilight';
import style from './response.module.css';

const getDarkMode = () =>
  document.body.classList.contains('dark') ||
  document.documentElement.classList.contains('dark');

const ResponseBody = ({ data, viewAs, wrap }) => {
  const [dark, setDark] = useState(getDarkMode());

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(getDarkMode());
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  if (viewAs === 'raw') {
    return (
      <pre className={style.raw_response}>
        {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
      </pre>
    );
  }

  if (viewAs === 'preview') {
    return (
      <iframe
        title="preview"
        srcDoc={typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
        className={style.preview_frame}
      />
    );
  }

  return (
    <div className={style.response_body}>
      <AceEditor
        mode={typeof data === 'object' ? 'json' : 'html'}
        fontSize={13}
        theme={dark ? 'twilight' : 'tomorrow'}
        value={typeof data === 'object' ? JSON.stringify(data, null, 2) : data}
        name="prettyJsonOutput"
        tabSize={2}
        editorProps={{ $blockScrolling: true }}
        readOnly
        wrapEnabled={wrap}
        highlightActiveLine={false}
        width="100%"
        setOptions={{
          showLineNumbers: true,
          useWorker: false,
        }}
      />
    </div>
  );
};

export default ResponseBody;
