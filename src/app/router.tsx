import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const LoginPage = lazy(() => import("../pages/LoginPage.tsx"));
const DesignCanvasPage = lazy(() => import("../pages/DesignCanvasPage.tsx"));
const DashboardPage = lazy(() => import("../pages/DashboardPage.tsx"));
const RepositoryCreatePage = lazy(() => import("../pages/RepositoryCreatePage.tsx"));
const RepositoriesPage = lazy(() => import("../pages/RepositoriesPage.tsx"));
const RepositoryDetailPage = lazy(() => import("../pages/RepositoryDetailPage.tsx"));
const PullRequestsPage = lazy(() => import("../pages/PullRequestsPage.tsx"));
const PullRequestDetailPage = lazy(() => import("../pages/PullRequestDetailPage.tsx"));
const PullRequestDiffPage = lazy(() => import("../pages/PullRequestDiffPage.tsx"));
const IssuesPage = lazy(() => import("../pages/IssuesPage.tsx"));
const IssueDetailPage = lazy(() => import("../pages/IssueDetailPage.tsx"));
const CommitsPage = lazy(() => import("../pages/CommitsPage.tsx"));
const ProfilePage = lazy(() => import("../pages/ProfilePage.tsx"));

export function AppRoutes(): JSX.Element {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/canvas" element={<DesignCanvasPage />} />
      <Route path="/" element={<DashboardPage />} />
      <Route path="/repositories/new" element={<RepositoryCreatePage />} />
      <Route path="/repositories" element={<RepositoriesPage />} />
      <Route path="/repositories/:repoId" element={<RepositoryDetailPage />} />
      <Route path="/pull-requests" element={<PullRequestsPage />} />
      <Route path="/pull-requests/:prId" element={<PullRequestDetailPage />} />
      <Route path="/pull-requests/:prId/diff" element={<PullRequestDiffPage />} />
      <Route path="/issues" element={<IssuesPage />} />
      <Route path="/issues/:issueId" element={<IssueDetailPage />} />
      <Route path="/commits" element={<CommitsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
