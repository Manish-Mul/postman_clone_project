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

// 🔹 NEW: enhanced preview - This should be defined above to avoid ReferenceError
const JsonPreview = ({ value }) => {
  const renderValueCell = (val) => {
    if (val === null || typeof val !== 'object') {
      return (
        <code style={{ whiteSpace: 'pre-wrap' }}>
          {typeof val === 'string' ? val : String(val)}
        </code>
      );
    }

    // For nested objects/arrays show a compact JSON block
    return (
      <pre
        style={{
          margin: 0,
          whiteSpace: 'pre-wrap',
          background: '#fafafa',
          borderRadius: 4,
          padding: '4px 6px',
          border: '1px solid #eee',
        }}
      >
        {JSON.stringify(val, null, 2)}
      </pre>
    );
  };

  if (Array.isArray(value)) {
    // Render array as a simple indexed table
    return (
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: '4px 8px' }}>Index</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: '4px 8px' }}>Value</th>
          </tr>
        </thead>
        <tbody>
          {value.map((item, index) => (
            <tr key={index}>
              <td style={{ padding: '4px 8px', verticalAlign: 'top' }}>{index}</td>
              <td style={{ padding: '4px 8px' }}>
                {renderValueCell(item)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // Object: top‑level keys as rows, nested objects pretty‑printed
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: '4px 8px', width: '180px' }}>
            Key
          </th>
          <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: '4px 8px' }}>
            Value
          </th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(value).map(([key, val]) => (
          <tr key={key}>
            <td style={{ padding: '4px 8px', verticalAlign: 'top', fontWeight: 500 }}>{key}</td>
            <td style={{ padding: '4px 8px' }}>
              {renderValueCell(val)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const ResponseBody = ({ data, wrap, viewAs, viewMode }) => {
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
    const text =
      typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    return (
      <pre style={{ whiteSpace: wrap ? 'pre-wrap' : 'pre' }}>{text}</pre>
    );
  }

  // 🔹 NEW: enhanced preview
  if (viewAs === 'preview') {
    // Try to parse JSON if it's a string
    let jsonValue = data;
    if (typeof data === 'string') {
      try {
        jsonValue = JSON.parse(data);
      } catch {
        jsonValue = null;
      }
    }

    if (!jsonValue || typeof jsonValue !== 'object') {
      const text =
        typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      return (
        <pre style={{ whiteSpace: 'pre-wrap' }}>{text}</pre>
      );
    }

    return <JsonPreview value={jsonValue} />;
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
