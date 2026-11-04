import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export function Brand({ to = "/owner" }: { to?: string }) {
  return <Link to={to} className="brand-lockup"><span className="brand-mark"><BookOpen size={19} /></span><span><strong>The Written Record</strong><small>Owner workspace</small></span></Link>;
}

export function PublicBrand() {
  return <Link to="/" className="public-brand"><span className="public-brand-mark"><BookOpen size={19} /></span><span><strong>The Written Record</strong><small>Writing · Research · Scholarship</small></span></Link>;
}