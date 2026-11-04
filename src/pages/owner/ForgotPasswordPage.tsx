import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, ArrowUpRight, Mail } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../../api";
import { Brand } from "../../components/Brand";
import { messageFor } from "../../lib/format";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const mutation = useMutation({
    mutationFn: () => authApi.forgotPassword(email.trim()),
    onSuccess: () => setSent(true),
  });

  return (
    <div className="signin-screen">
      <div className="signin-visual">
        <div className="visual-grain" />
        <div className="visual-top"><Brand to="/" /><span className="practice-tag"><span /> PERSONAL PORTFOLIO</span></div>
        <div className="visual-copy">
          <p className="eyebrow">Account recovery</p>
          <h1>Reset your<br /><em>password.</em></h1>
          <p className="visual-description">Enter your email address and we&rsquo;ll send you a reset token.</p>
        </div>
        <div className="visual-bottom"><span>WRITTEN WITH CARE</span><span>02 / RECOVERY</span></div>
      </div>

      <div className="signin-form-side">
        <div className="signin-form-wrap">
          <Brand to="/" />

          {sent ? (
            <div style={{ marginTop: 48 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--pale)", display: "grid", placeItems: "center", color: "var(--green)", marginBottom: 20 }}>
                <Mail size={22} />
              </div>
              <h2 style={{ margin: "0 0 10px", fontFamily: "'Newsreader', serif", fontSize: 28, fontWeight: 500 }}>Check your email</h2>
              <p style={{ margin: "0 0 24px", color: "var(--muted)", fontSize: 11, lineHeight: 1.75 }}>
                If <strong>{email}</strong> is registered, a reset token has been sent. Check your inbox. If you are running locally, check <code style={{ fontSize: 10, background: "var(--pale)", padding: "1px 5px", borderRadius: 4 }}>storage/logs/laravel.log</code>.
              </p>
              <Link to={`/reset-password?email=${encodeURIComponent(email)}`} className="button button-primary button-wide" style={{ display: "inline-flex" }}>
                I have my token <ArrowUpRight size={15} />
              </Link>
              <p style={{ marginTop: 16 }}>
                <Link to="/owner-login" style={{ color: "var(--muted)", fontSize: 10, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <ArrowLeft size={13} /> Back to sign in
                </Link>
              </p>
            </div>
          ) : (
            <>
              <div className="signin-heading">
                <p className="eyebrow">PASSWORD RECOVERY</p>
                <h2>Forgot your password?</h2>
                <p>Enter the email address for your owner account.</p>
              </div>

              <form className="form-stack" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
                <label className="field-label" htmlFor="email">
                  Email address
                  <input id="email" type="email" autoComplete="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>
                {mutation.isError && <p className="form-error" role="alert">{messageFor(mutation.error)}</p>}
                <button className="button button-primary button-wide" disabled={mutation.isPending}>
                  {mutation.isPending ? "Sending…" : "Send reset token"}<ArrowUpRight size={16} />
                </button>
              </form>

              <p style={{ marginTop: 20 }}>
                <Link to="/owner-login" style={{ color: "var(--muted)", fontSize: 10, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <ArrowLeft size={13} /> Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
