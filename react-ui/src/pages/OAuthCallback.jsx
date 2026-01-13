import { useEffect, useContext, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { Context } from '../contexts/Store';

export default function OAuthCallback() {
    const [params] = useSearchParams();
    const code = params.get('code');
    const navigate = useNavigate();
    const { state, dispatch } = useContext(Context);

    const hasRun = useRef(false); // 👈 guard

    useEffect(() => {
        if (!code || hasRun.current) return;
        hasRun.current = true;

        async function exchange() {
            try {
                // const res = await api.post(state.auth.tokenUrl, {
                //     grant_type: 'authorization_code',
                //     code,
                //     redirect_uri: state.auth.redirectUri,
                //     client_id: state.auth.clientId,
                //     client_secret: state.auth.clientSecret
                // });

                const res = await api.post('/oauth/token', {
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri: state.auth.redirectUri,
                    client_id: state.auth.clientId,
                    client_secret: state.auth.clientSecret
                });

                dispatch({
                    type: 'SET_AUTH',
                    payload: {
                        accessToken: res.data.access_token,
                        refreshToken: res.data.refresh_token,
                        expiresAt: Date.now() + res.data.expires_in * 1000
                    }
                });

                // ⏳ small delay for UX
                setTimeout(() => {
                    navigate('/app');
                }, 800);
                
            } catch (err) {
                console.error('OAuth exchange failed:', err.response?.data || err.message);
            }
        }

        exchange();
    }, [code]); // 👈 depends on code

    return <div>Authorizing...</div>;
}