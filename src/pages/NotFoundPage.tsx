import { Link } from "react-router-dom";

export function NotFoundPage() {
  return <div className="not-found"><p className="eyebrow">404 / NOT FOUND</p><h1>This page isn’t in the journal.</h1><Link to="/" className="button button-primary">Back to the journal</Link></div>;
}