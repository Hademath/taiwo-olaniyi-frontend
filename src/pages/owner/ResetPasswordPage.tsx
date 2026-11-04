import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, ArrowUpRight, CheckCircle, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../../api";
import { Brand } from "../../components/Brand";
import { messageFor } from "../../lib/format";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = params.get("email") ?? "";
  const urlToken = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);

  const passwordsMatch = password === confirm;
  const canSubmit = password.length >= 8 && passwordsMatch && email && urlToken;

  const mutation = useMutation({
    mutationFn: () => authApi.resetPassword(email, urlToken, password, confirm),
    onSuccess: () => setDone(true),
  });

  if (!email || !urlToken) {
    return (
      <div className="signin-screen">
        <div className="signin-visual">
          <div className="visual-grain" />
          <div className="visual-top"><Brand to="/" /></div>
          <div className="visual-copy"><h1>Invalid<br /><em>link.</em></h1></div>
        </div>
        <div className="signin-form-side">
          <div className="signin-form-wrap" style={{ marginTop: 80 }}>
            <h2 style={{ margin: "0 0 10px", fontFamily: "'Newsreader', serif", fontSize: 28, fontWeight: 500 }}>Link expired or invalid</h2>
            <p style={{ color: "var(--muted)", fontSize: 11, lineHeight: 1.75, margin: "0 0 24px" }}>
              This reset link is missing required information. Please request a new one.
            </p>
            <Link to="/forgot-password" className="button button-primary button-wide" style={{ display: "inline-flex" }}>
              Request new link <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="signin-screen">
        <div className="signin-visual">
          <div className="visual-grain" />
          <div className="visual-top"><Brand to="/" /></div>
          <div className="visual-copy"><h1>Password<br /><em>updated.</em></h1></div>
        </div>
        <div className="signin-form-side">
          <div className="signin-form-wrap" style={{ marginTop: 80 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#e8f4ee", display: "grid", placeItems: "center", color: "#2e7d52", marginBottom: 20 }}>
              <CheckCircle size={22} />
            </div>
            <h2 style={{ margin: "0 0 10px", fontFamily: "'Newsreader', serif", fontSize: 28, fontWeight: 500 }}>All done!</h2>
            <p style={{ color: "var(--muted)", fontSize: 11, lineHeight: 1.75, margin: "0 0 28px" }}>
              Your password has been updated. You can now sign in with your new password.
            </p>
            <button className="button button-primary button-wide" onClick={() => navigate("/owner-login")}>
              Go to sign in <ArrowUpRight size={15} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="signin-screen">
      <div className="signin-visual">
        <div className="visual-grain" />
        <div className="visual-top"><Brand to="/" /><span className="practice-tag"><span /> PERSONAL PORTFOLIO</span></div>
        <div className="visual-copy">
          <p className="eyebrow">Account recovery</p>
          <h1>Choose a new<br /><em>password.</em></h1>
          <p className="visual-description">Pick a strong password for your owner account.</p>
        </div>
        <div className="visual-bottom"><span>WRITTEN WITH CARE</span><span>03 / RESET</span></div>
      </div>

      <div className="signin-form-side">
        <div className="signin-form-wrap">
          <Brand to="/" />
          <div className="signin-heading">
            <p className="eyebrow">SET NEW PASSWORD</p>
            <h2>Reset password</h2>
            <p>Resetting for <strong style={{ color: "var(--ink)" }}>{email}</strong></p>
          </div>

          <form className="form-stack" onSubmit={(e) => { e.preventDefault(); if (canSubmit) mutation.mutate(); }}>
            <label className="field-label" htmlFor="new-password">
              New password
              <div className="password-wrap">
                <input id="new-password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="At least 8 characters" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" className="eye-toggle" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </label>

            <label className="field-label" htmlFor="confirm-password">
              Confirm new password
              <div className="password-wrap">
                <input id="confirm-password" type={showConfirm ? "text" : "password"} autoComplete="new-password" placeholder="Repeat your new password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                <button type="button" className="eye-toggle" onClick={() => setShowConfirm((v) => !v)} aria-label={showConfirm ? "Hide password" : "Show password"}>
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </label>

            {confirm && !passwordsMatch && <p className="form-error" role="alert">Passwords do not match.</p>}
            {mutation.isError && <p className="form-error" role="alert">{messageFor(mutation.error)}</p>}

            <button className="button button-primary button-wide" disabled={mutation.isPending || !canSubmit}>
              {mutation.isPending ? "Updating…" : "Update password"}<ArrowUpRight size={16} />
            </button>
          </form>

          <p style={{ marginTop: 20 }}>
            <Link to="/owner-login" style={{ color: "var(--muted)", fontSize: 10, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}>
              <ArrowLeft size={13} /> Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
