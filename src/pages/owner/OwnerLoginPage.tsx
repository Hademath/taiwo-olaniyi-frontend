import { useMutation } from "@tanstack/react-query";
import { ArrowUpRight, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { authApi } from "../../api";
import { useAuthStore } from "../../auth";
import { Brand } from "../../components/Brand";
import { messageFor } from "../../lib/format";

export function OwnerLoginPage() {
  const token = useAuthStore((state) => state.token);
  const setSession = useAuthStore((state) => state.setSession);
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const mutation = useMutation({
    mutationFn: () => authApi.login(email.trim(), password),
    onSuccess: (session) => {
      setSession(session.access_token, session.admin);
      navigate(location.state?.from || "/owner", { replace: true });
    },
    onError: (error) => toast.error(messageFor(error)),
  });

  if (token) return <Navigate to="/owner" replace />;

  return (
    <div className="signin-screen">
      <div className="signin-visual">
        <div className="visual-grain" />
        <div className="visual-top"><Brand to="/" /><span className="practice-tag"><span /> PERSONAL PORTFOLIO</span></div>
        <div className="visual-copy">
          <p className="eyebrow">A place for considered work</p>
          <h1>Language is a practice.<br /><em>So is scholarship.</em></h1>
          <p className="visual-description">A quiet space to manage your work, share your scholarship, and engage with your readers.</p>
          <div className="quote-mark">&ldquo;</div>
          <p className="visual-quote">The best writing begins with the willingness to keep revising.</p>
        </div>
        <div className="visual-bottom"><span>WRITTEN WITH CARE</span><span>01 / PORTFOLIO</span></div>
      </div>

      <div className="signin-form-side">
        <div className="signin-form-wrap">
          <Brand to="/" />
          <div className="signin-heading">
            <p className="eyebrow">OWNER ACCESS</p>
            <h2>Welcome back</h2>
            <p>Sign in to manage your articles and reader comments.</p>
          </div>

          <form className="form-stack" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
            <label className="field-label" htmlFor="email">
              Email address
              <input id="email" type="email" autoComplete="username" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>

            <label className="field-label" htmlFor="password">
              Password
              <div className="password-wrap">
                <input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" className="eye-toggle" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </label>

            <div style={{ textAlign: "right", marginTop: -8 }}>
              <Link to="/forgot-password" style={{ color: "var(--muted)", fontSize: 10, fontWeight: 600 }}>Forgot password?</Link>
            </div>

            {mutation.isError && <p className="form-error" role="alert">{messageFor(mutation.error)}</p>}
            <button className="button button-primary button-wide" disabled={mutation.isPending}>
              {mutation.isPending ? "Signing in…" : "Sign in to portfolio"}<ArrowUpRight size={16} />
            </button>
          </form>

          <p className="signin-privacy">By signing in, you agree to manage your portfolio content responsibly.</p>
        </div>
      </div>
    </div>
  );
}
