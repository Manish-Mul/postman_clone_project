import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import '../src/monacoWorkers';

// Pages
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import SignupPage from './pages/SignupPage';
import OAuthCallback from './pages/OAuthCallback';

// Layout
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import WorkspaceHeader from './components/layout/WorkspaceHeader';
import Playground from './components/playground/Playground';

// Contexts
import Store, { Context } from './contexts/Store';
import { ThemeProvider } from './contexts/ThemeContext';
import CollectionsProvider from './contexts/Collections';
import AuthProvider, { AuthContext } from './contexts/Auth';
import EnvironmentsProvider from './contexts/Environments';
import HistoryProvider from './contexts/History';
import WorkspacesProvider from './contexts/Workspaces';
import CurlImportModal from "./components/modals/CurlImportModal";
import CollectionImportModal from './components/modals/CollectionImportModal';
import { WorkspacesContext } from './contexts/Workspaces';
import { buildWorkspaceSnapshot } from './utils/workspaceSnapshot';
import GlobalVariablesProvider from './contexts/GlobalVariables';

import './theme.css';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/signin" replace />;
}

// Public Route Component
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/app" replace /> : children;
}

function AppInterface() {
  const { state } = useContext(Context);
  const { currentWorkspaceId } = useContext(WorkspacesContext);

  console.log('AppInterface currentWorkspaceId:', currentWorkspaceId);

  return (
    <div className="App">
      <Header />
      <section>
        {state && (
          <>
            <aside className={state.sideDrawerOpened ? '' : 'collapsed'}>
              <Sidebar />
            </aside>
            <Playground />
            {state.curlModalOpen && <CurlImportModal />}
            {state.showCollectionImportModal && (
              <CollectionImportModal workspaceId={currentWorkspaceId} />
            )}
          </>
        )}
      </section>
      <Footer />
    </div>
  );
}

const LOCAL_KEY = 'postmanClone:data:v1';

function AutosaveManager() {
  const { workspaces, loading } = useContext(WorkspacesContext);
  const { collections } = useContext(CollectionsContext);
  const { environments } = useContext(EnvironmentsContext);
  const { history } = useContext(HistoryContext);

  useEffect(() => {
    if (loading) return; // avoid saving while bootstrapping
    const snapshot = buildWorkspaceSnapshot({
      workspacesState: workspaces,
      collectionsState: collections,
      environmentsState: environments,
      historyState: history,
    });
    localStorage.setItem(LOCAL_KEY, JSON.stringify(snapshot));
  }, [workspaces, collections, environments, history, loading]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <GlobalVariablesProvider>
        <WorkspacesProvider>
          <HistoryProvider>
            <EnvironmentsProvider>
              <Store>
                <CollectionsProvider>
                  <ThemeProvider>
                    <Routes>
                      {/* Public Routes */}
                      <Route
                        path="/"
                        element={
                          <PublicRoute>
                            <LandingPage />
                          </PublicRoute>
                        }
                      />
                      <Route
                        path="/signin"
                        element={
                          <PublicRoute>
                            <SignInPage />
                          </PublicRoute>
                        }
                      />
                      <Route
                        path="/signup"
                        element={
                          <PublicRoute>
                            <SignupPage />
                          </PublicRoute>
                        }
                      />

                      {/* OAuth Redirect */}
                      <Route path="/oauth-callback" element={<OAuthCallback />} />

                      {/* Protected Routes */}
                      <Route
                        path="/app"
                        element={
                          <ProtectedRoute>
                            <AppInterface />
                          </ProtectedRoute>
                        }
                      />

                      {/* All redirect */}
                      <Route path="*" element={<Navigate to="/signin" replace />} />
                    </Routes>
                  </ThemeProvider>
                </CollectionsProvider>
              </Store>
            </EnvironmentsProvider>
          </HistoryProvider>
        </WorkspacesProvider>
      </GlobalVariablesProvider>
    </AuthProvider>
  );
}

export default App;