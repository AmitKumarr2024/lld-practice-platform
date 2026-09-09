import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "./Layout";
import { ProtectedRoute } from "./ProtectedRoute";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { ProblemsPage } from "../pages/ProblemsPage";
import { ProblemDetailsPage } from "../pages/ProblemDetailsPage";
import { PracticePage } from "../pages/PracticePage";
import { FeedbackPage } from "../pages/FeedbackPage";
import { HistoryPage } from "../pages/HistoryPage";
import { AdminPage } from "../pages/AdminPage";
import { AdminEvaluationPage } from "../pages/AdminEvaluationPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      {
        path: "problems",
        element: (
          <ProtectedRoute>
            <ProblemsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "problems/:id",
        element: (
          <ProtectedRoute>
            <ProblemDetailsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "attempts/:id/practice",
        element: (
          <ProtectedRoute>
            <PracticePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "attempts/:id",
        element: (
          <ProtectedRoute>
            <FeedbackPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "history",
        element: (
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute adminOnly>
            <AdminPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/attempts/:id",
        element: (
          <ProtectedRoute adminOnly>
            <AdminEvaluationPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
