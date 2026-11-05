import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { OwnerLayout } from "./components/OwnerLayout";
import { PublicLayout } from "./components/PublicLayout";
import { RequireOwner } from "./components/RequireOwner";
import { AchievementEditorPage } from "./pages/owner/AchievementEditorPage";
import { ForgotPasswordPage } from "./pages/owner/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/owner/ResetPasswordPage";
import { AchievementsPage } from "./pages/owner/AchievementsPage";
import { CommentsPage } from "./pages/owner/CommentsPage";
import { DashboardPage } from "./pages/owner/DashboardPage";
import { OwnerLoginPage } from "./pages/owner/OwnerLoginPage";
import { PostEditorPage } from "./pages/owner/PostEditorPage";
import { PostsPage } from "./pages/owner/PostsPage";
import { PublicationEditorPage } from "./pages/owner/PublicationEditorPage";
import { PublicationsPage } from "./pages/owner/PublicationsPage";
import { SiteSettingsPage } from "./pages/owner/SiteSettingsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PublicArticlePage } from "./pages/public/PublicArticlePage";
import { PublicFeedPage } from "./pages/public/PublicFeedPage";
import { PublicPublicationsPage } from "./pages/public/PublicPublicationsPage";

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } });

const isAdminSubdomain = window.location.hostname.startsWith("admin.");

const ownerRoutes = [
  { path: "/", element: <OwnerLoginPage /> },
  { path: "/owner-login", element: <OwnerLoginPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  {
    path: "/owner",
    element: <RequireOwner />,
    children: [
      {
        element: <OwnerLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "posts", element: <PostsPage /> },
          { path: "posts/new", element: <PostEditorPage /> },
          { path: "posts/:id/edit", element: <PostEditorPage /> },
          { path: "publications", element: <PublicationsPage /> },
          { path: "publications/new", element: <PublicationEditorPage /> },
          { path: "publications/:id/edit", element: <PublicationEditorPage /> },
          { path: "achievements", element: <AchievementsPage /> },
          { path: "achievements/new", element: <AchievementEditorPage /> },
          { path: "achievements/:id/edit", element: <AchievementEditorPage /> },
          { path: "comments", element: <CommentsPage /> },
          { path: "settings", element: <SiteSettingsPage /> },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
];

const publicRoutes = [
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <PublicFeedPage /> },
      { path: "articles/:slug", element: <PublicArticlePage /> },
      { path: "publications", element: <PublicPublicationsPage /> },
      { path: "achievements", element: <PublicAchievementsPage /> },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
];

const router = createBrowserRouter(isAdminSubdomain ? ownerRoutes : publicRoutes);

export default function App() {
  return <QueryClientProvider client={queryClient}><RouterProvider router={router} /><Toaster position="top-right" toastOptions={{ duration: 3500 }} /></QueryClientProvider>;
}
