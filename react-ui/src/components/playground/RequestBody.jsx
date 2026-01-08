import { useContext, useState } from 'react';
import { Context } from '../../contexts/Store';
import styles from './playground.module.css';
import RawPayload from './RawPayload';
import FormUrlEncoded from './FormUrlEncoded';
import FormDataPayload from './FormDataPayload';

const RequestBody = () => {
  const { state, dispatch } = useContext(Context);
  const [bodyType, setBodyType] = useState(state.formData.bodyType || (state.formData.payload ? 'raw' : ''));
  const [rawBodyType, setRawBodyType] = useState(state.formData.rawBodyType || 'json');

  const handleChange = (event) => {
    const value = event.target.value;
    setBodyType(value);
    dispatch({ type: 'SET_BODY_TYPE', payload: value });
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
      <div className={styles.inline_radios}>
        <label htmlFor="radio-body-none">
          <input
            type="radio"
            value=""
            checked={bodyType === ''}
            id="radio-body-none"
            onChange={handleChange}
            name="bodyType"
          />
          None
        </label>
        <label htmlFor="radio-body-form-data">
          <input
            type="radio"
            value="form-data"
            checked={bodyType === 'form-data'}
            id="radio-body-form-data"
            onChange={handleChange}
            name="bodyType"
          />
          form-data
        </label>
        <label htmlFor="radio-body-urlencoded">
          <input
            type="radio"
            value="url-encoded"
            checked={bodyType === 'url-encoded'}
            id="radio-body-urlencoded"
            onChange={handleChange}
            name="bodyType"
          />
          x-www-form-encoded
        </label>
        <label htmlFor="radio-body-raw">
          <input
            type="radio"
            value="raw"
            checked={bodyType === 'raw'}
            id="radio-body-raw"
            onChange={handleChange}
            name="bodyType"
          />
          raw
        </label>
        <label htmlFor="radio-body-binary" className={styles.disabled_radio}>
          <input
            type="radio"
            value="binary"
            id="radio-body-binary"
            onChange={handleChange}
            name="bodyType"
            disabled
          />
          binary
        </label>
        <label htmlFor="radio-body-gql" className={styles.disabled_radio}>
          <input
            type="radio"
            value="graphql"
            id="radio-body-gql"
            onChange={handleChange}
            name="bodyType"
            disabled
          />
          GraphQL
        </label>
        {bodyType === 'raw' && (
          <div className={styles.raw_body_options}>
            <select
              className={styles.raw_body_formats}
              value={rawBodyType}
              onChange={(e) => {
                const v = e.target.value;
                setRawBodyType(v);
                dispatch({ type: 'SET_RAW_BODY_TYPE', payload: v });
              }}

            >
              <option value="text">
                Text
              </option>
              <option value="xml">
                XML
              </option>
              <option value="json">JSON</option>
              <option value="auto" disabled>
                Javascript
              </option>
              <option value="html" disabled>
                HTML
              </option>
            </select>
            <span role="button" className={styles.beautify_btn}>
              Beautify
            </span>
          </div>
        )}
      </div>

      <div>
        {/* Conditional rendering based on bodyType */}
        <div>
          {bodyType === '' && (
            <div className={styles.no_body_panel}>
              This request does not have a body
            </div>
          )}

          {bodyType === 'url-encoded' && <FormUrlEncoded />}

          {bodyType === 'form-data' && <FormDataPayload />}

          {bodyType === 'raw' && (
            <div className={styles.raw_body_panel}>
              <RawPayload mode={rawBodyType} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestBody;
