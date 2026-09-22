import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  return (
    <div className="synapse-home-container">
      {/* <style>{`
        
      `}</style> */}

      {/* Navigation */}
      <nav className="home-nav">
        <Link to="/" className="home-brand">
          <div className="brand-icon-wrapper">
            <i className="fa-solid fa-brain"></i>
          </div>
          <span className="brand-text">SynapseGPT</span>
          <span className="brand-badge">AI</span>
        </Link>

        <div className="nav-actions">
          <Link to="/login" className="nav-link-login">
            Login
          </Link>
          <Link to="/signup" className="nav-btn-signup">
            <span>Signup</span>
            <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="hero-section">
        <div className="hero-pill">
          <i className="fa-solid fa-wand-magic-sparkles"></i>
          <span>Intelligent Conversations, Elevated</span>
        </div>

        <h1 className="hero-title">
          Next-Generation AI Chat for{" "}
          <span className="hero-gradient-text">Brilliant Minds</span>
        </h1>

        <p className="hero-description">
          Experience fluid, insightful conversations with SynapseGPT. Manage multi-topic
          threads, brainstorm complex concepts, and boost your daily workflow with responsive AI.
        </p>

        <div className="hero-cta-group">
          <Link to="/signup" className="cta-btn-primary">
            <span>Start Free Trial</span>
            <i className="fa-solid fa-arrow-right"></i>
          </Link>
          <Link to="/login" className="cta-btn-secondary">
            <i className="fa-solid fa-arrow-right-to-bracket"></i>
            <span>Sign In to Chat</span>
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-box icon-indigo">
              <i className="fa-solid fa-bolt-lightning"></i>
            </div>
            <h3 className="feature-title">Fast & Intuitive</h3>
            <p className="feature-text">
              Instant responses crafted with accuracy, designed to keep your thinking fast and uninterrupted.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box icon-sky">
              <i className="fa-solid fa-layer-group"></i>
            </div>
            <h3 className="feature-title">Thread Management</h3>
            <p className="feature-text">
              Organize individual conversation histories cleanly, revisit earlier topics, and resume whenever you want.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box icon-violet">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <h3 className="feature-title">Private & Secure</h3>
            <p className="feature-text">
              Protected authentication safeguards your tokens and sessions so your discussions stay completely confidential.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-brand">
          <span>&copy; {new Date().getFullYear()} SynapseGPT. All rights reserved.</span>
        </div>
        <div className="footer-links">
          <Link to="/login" className="footer-link">Login</Link>
          <Link to="/signup" className="footer-link">Signup</Link>
        </div>
      </footer>
    </div>
  );
}