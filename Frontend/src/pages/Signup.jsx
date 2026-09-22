import { useState } from "react";
import { signup } from "../api";
import "./Signup.css";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await signup(form);
      if (res && res.message && !res.error) {
        alert(res.message);
        navigate("/login");
      } else {
        alert(res.error || res.message || "Signup failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong during signup. Please try again.");
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
          <h2 className="auth-title">Create an Account</h2>
          <p className="auth-subtitle">
            Join SynapseGPT to start intelligent conversations today
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="signup-username">
              Username
            </label>
            <div className="input-wrapper">
              <i className="fa-regular fa-user input-icon"></i>
              <input
                id="signup-username"
                type="text"
                placeholder="Choose a username"
                value={form.username}
                required
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="signup-email">
              Email Address
            </label>
            <div className="input-wrapper">
              <i className="fa-regular fa-envelope input-icon"></i>
              <input
                id="signup-email"
                type="email"
                placeholder="name@example.com"
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
            <label className="form-label" htmlFor="signup-password">
              Password
            </label>
            <div className="input-wrapper">
              <i className="fa-solid fa-lock input-icon"></i>
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
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
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Sign Up</span>
                <i className="fa-solid fa-arrow-right"></i>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-text">
          Already have an account?
          <Link to="/login" className="auth-footer-link">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}