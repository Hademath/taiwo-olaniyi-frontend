import { Link, Outlet } from "react-router-dom";
import { PublicBrand } from "./Brand";
import { ThemeToggle } from "./ThemeToggle";
import "../public.css";

const currentYear = new Date().getFullYear();

export function PublicLayout() {
  return <div className="public-site">
    <header className="public-header">
      <PublicBrand />
      <nav className="public-nav" aria-label="Public navigation"><a href="/#writing">Writing</a><Link to="/publications">Research</Link><Link to="/achievements">Recognition</Link><a href="/#about">About</a><ThemeToggle /></nav>
    </header>
    <Outlet />
    <footer className="public-footer"><Link to="/" className="public-footer-brand">The Written Record</Link><span>Writing, research, and ideas in the open.</span><span>© {currentYear}</span></footer>
  </div>;
}