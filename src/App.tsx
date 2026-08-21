
import {
  lazy,
  Suspense,
  useEffect,
} from "react";

import {
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import ProtectedRoute from "./routes/ProtectedRoute";

import { getCurrentUser } from "./services/authApi";
import { refreshAccessToken } from "./services/refreshApi";

import { useAuthStore } from "./store/authStore";

import NotificationCenter from "./components/NotificationCenter";

// ========================================
// LAZY LOADED PAGES
// ========================================

const Login = lazy(() => import("./pages/Login"));
const Board = lazy(() => import("./pages/Board"));
const Analytics = lazy(() => import("./pages/Analytics"));

// ========================================
// DASHBOARD
// ========================================

function Dashboard() {
  const navigate = useNavigate();

  const logout = useAuthStore(
    (state) => state.logout
  );

  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          SprintDesk Dashboard
        </h1>

        <div className="flex items-center gap-4">
          <NotificationCenter />

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

// ========================================
// LOADING FALLBACK
// ========================================

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />

        <p className="text-slate-600">
          Loading page...
        </p>
      </div>
    </div>
  );
}

// ========================================
// APP
// ========================================

function App() {
  const setAuth = useAuthStore(
    (state) => state.setAuth
  );

  const isInitializing = useAuthStore(
    (state) => state.isInitializing
  );

  const setInitializing = useAuthStore(
    (state) => state.setInitializing
  );

  // ========================================
  // RESTORE SESSION
  // ========================================

  useEffect(() => {
    const restoreSession = async () => {
      const refreshToken =
        localStorage.getItem("refreshToken");

      if (!refreshToken) {
        setInitializing(false);
        return;
      }

      try {
        // 1. Refresh token se new access token
        const tokenData =
          await refreshAccessToken(refreshToken);

        // 2. New access token store karo
        useAuthStore
          .getState()
          .updateAccessToken(
            tokenData.accessToken
          );

        // 3. New refresh token save karo
        localStorage.setItem(
          "refreshToken",
          tokenData.refreshToken
        );

        // 4. Current user fetch karo
        const user = await getCurrentUser();

        // 5. Authentication complete
        setAuth(
          tokenData.accessToken,
          user
        );
      } catch (error) {
        console.error(
          "Session restore failed:",
          error
        );

        localStorage.removeItem(
          "refreshToken"
        );
      } finally {
        setInitializing(false);
      }
    };

    restoreSession();
  }, [setAuth, setInitializing]);

  // ========================================
  // INITIAL SESSION LOADING
  // ========================================

  if (isInitializing) {
    return <PageLoader />;
  }

  // ========================================
  // ROUTES
  // ========================================

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public route */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* Protected routes */}

        <Route
          element={<ProtectedRoute />}
        >
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/board"
            element={<Board />}
          />

          <Route
            path="/analytics"
            element={<Analytics />}
          />
        </Route>

        {/* Unknown route */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />
      </Routes>
    </Suspense>
  );
}

export default App;

