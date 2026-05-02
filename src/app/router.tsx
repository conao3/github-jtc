import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const DashboardPage = lazy(() => import("../pages/DashboardPage.tsx"));
const RepositoriesPage = lazy(() => import("../pages/RepositoriesPage.tsx"));
const RepositoryDetailPage = lazy(() => import("../pages/RepositoryDetailPage.tsx"));
const PullRequestsPage = lazy(() => import("../pages/PullRequestsPage.tsx"));
const PullRequestDetailPage = lazy(() => import("../pages/PullRequestDetailPage.tsx"));
const IssuesPage = lazy(() => import("../pages/IssuesPage.tsx"));
const IssueDetailPage = lazy(() => import("../pages/IssueDetailPage.tsx"));
const CommitsPage = lazy(() => import("../pages/CommitsPage.tsx"));
const ProfilePage = lazy(() => import("../pages/ProfilePage.tsx"));

export function AppRoutes(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/repositories" element={<RepositoriesPage />} />
      <Route path="/repositories/:repoId" element={<RepositoryDetailPage />} />
      <Route path="/pull-requests" element={<PullRequestsPage />} />
      <Route path="/pull-requests/:prId" element={<PullRequestDetailPage />} />
      <Route path="/issues" element={<IssuesPage />} />
      <Route path="/issues/:issueId" element={<IssueDetailPage />} />
      <Route path="/commits" element={<CommitsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
