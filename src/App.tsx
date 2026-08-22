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
  Link,
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
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              SprintDesk Dashboard
            </h1>

            <p className="mt-2 text-slate-600">
              Manage your sprint tasks, board and analytics.
            </p>
          </div>

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

        {/* Navigation Cards */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">

          {/* Board */}
          <Link
            to="/board"
            className="rounded-xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <h2 className="text-xl font-semibold">
              Sprint Board
            </h2>

            <p className="mt-2 text-slate-600">
              Manage and track your sprint tasks.
            </p>

            <span className="mt-4 inline-block font-semibold text-blue-600">
              Open Board →
            </span>
          </Link>

          {/* Analytics */}
          <Link
            to="/analytics"
            className="rounded-xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <h2 className="text-xl font-semibold">
              Analytics
            </h2>

            <p className="mt-2 text-slate-600">
              View sprint progress and task analytics.
            </p>

            <span className="mt-4 inline-block font-semibold text-blue-600">
              View Analytics →
            </span>
          </Link>

        </div>
      </div>
    </main>
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
        const tokenData =
          await refreshAccessToken(refreshToken);

        useAuthStore
          .getState()
          .updateAccessToken(
            tokenData.accessToken
          );

        localStorage.setItem(
          "refreshToken",
          tokenData.refreshToken
        );

        const user = await getCurrentUser();

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