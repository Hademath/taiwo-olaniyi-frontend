import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, ArrowUpRight, BookMarked, FileText, LogOut, Menu, MessageCircle, Search, Settings, ShieldCheck, Trophy, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { authApi, postsApi } from "../api";
import { useAuthStore } from "../auth";
import { Brand } from "./Brand";
import { ThemeToggle } from "./ThemeToggle";

const navigation = [
  { to: "/owner", label: "Overview", icon: Activity, end: true },
  { to: "/owner/posts", label: "Writing", icon: FileText },
  { to: "/owner/publications", label: "Publications", icon: BookMarked },
  { to: "/owner/achievements", label: "Achievements", icon: Trophy },
  { to: "/owner/comments", label: "Comments", icon: MessageCircle },
  { to: "/owner/settings", label: "Site", icon: Settings },
];
const currentYear = new Date().getFullYear();

export function OwnerLayout() {
  const admin = useAuthStore((state) => state.admin);
  const clear = useAuthStore((state) => state.clear);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const title = location.pathname.startsWith("/owner/settings") ? "Site Settings" : location.pathname.startsWith("/owner/comments") ? "Comments" : location.pathname.startsWith("/owner/achievements") ? "Achievements" : location.pathname.startsWith("/owner/publications") ? "Publications" : location.pathname.includes("/edit") || location.pathname.includes("/new") ? "Write an article" : location.pathname.startsWith("/owner/posts") ? "Writing" : "Overview";

  async function signOut() {
    try { await authApi.logout(); } catch { /* Clear local auth even if the API is unavailable. */ }
    clear();
    queryClient.clear();
    navigate("/owner-login", { replace: true });
  }

  return <div className="app-shell">
    <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
      <div className="sidebar-top"><Brand /><button className="icon-button mobile-close" aria-label="Close navigation" onClick={() => setMenuOpen(false)}><X size={18} /></button></div>
      <div className="side-section-label">WORKSPACE</div>
      <nav className="side-nav" aria-label="Owner navigation">
        {navigation.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}><Icon size={18} strokeWidth={1.8} /><span>{label}</span>{label === "Comments" && <PendingCount />}</NavLink>)}
      </nav>
      <div className="sidebar-spacer" />
      <div className="sidebar-note"><span className="note-icon"><ShieldCheck size={17} /></span><div><strong>Your portfolio</strong><p>Keep unpublished work in draft until ready.</p></div></div>
      <button className="account-row" onClick={signOut} title="Sign out"><span className="avatar">{admin?.name?.slice(0, 1) ?? "A"}</span><span className="account-copy"><strong>{admin?.name ?? "Scholar"}</strong><small>Owner account</small></span><LogOut size={16} className="account-logout" /></button>
    </aside>
    {menuOpen && <button className="scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    <div className="workspace">
      <header className="topbar"><button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Menu size={19} /></button><div className="crumb"><span>Portfolio</span><span className="crumb-slash">/</span><strong>{title}</strong></div><label className="search-box"><Search size={16} /><input aria-label="Search writing" placeholder="Search your writing" value={searchText} onChange={(event) => setSearchText(event.target.value)} /><kbd>⌘ K</kbd></label><ThemeToggle /><a className="site-link" href={`${window.location.protocol}//${window.location.hostname.replace(/^admin\./, '')}`} target="_blank" rel="noreferrer">View website <ArrowUpRight size={14} /></a></header>
      <main className="page-content"><Outlet context={{ searchText }} /></main>
      <footer className="footer"><span>© {currentYear} The Written Record</span><span>Writing, research, and ideas in the open.</span></footer>
    </div>
  </div>;
}

function PendingCount() {
  const { data } = useQuery({ queryKey: ["comments", "pending"], queryFn: () => postsApi.comments("pending"), staleTime: 60_000 });
  return data?.total ? <span className="nav-count">{data.total}</span> : null;
}