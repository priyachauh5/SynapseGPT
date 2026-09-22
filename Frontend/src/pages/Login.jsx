import { useState } from "react";
import { login } from "../api";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await login(form);

      if (res.token) {
        localStorage.setItem("token", res.token);
        alert("Login successful");
        navigate("/chat"); // 🔥 redirect to chat
      } else {
        alert(res.message || res.error || "Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="synapse-auth-page">
      {/* <style>{`
        
      `}</style> */}

      <div className="auth-top-nav">
        <Link to="/" className="back-home-link">
          <i className="fa-solid fa-arrow-left"></i>
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-badge">
            <i className="fa-solid fa-brain"></i>
          </div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">
            Enter your credentials to access your SynapseGPT account
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Email Address
            </label>
            <div className="input-wrapper">
              <i className="fa-regular fa-envelope input-icon"></i>
              <input
                id="login-email"
                type="text"
                autoCapitalize="none"
                autoCorrect="off"
                placeholder="Email or username"
                value={form.email}
                required
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Password
            </label>
            <div className="input-wrapper">
              <i className="fa-solid fa-lock input-icon"></i>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={form.password}
                required
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                className="form-input"
                style={{ paddingRight: "42px" }}
              />
              <button
                type="button"
                className="password-toggle-btn"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={showPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye"}></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin"></i>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <i className="fa-solid fa-arrow-right"></i>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-text">
          Don't have an account?
          <Link to="/signup" className="auth-footer-link">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}