import React, { useState, useRef } from 'react';
import sitexLogo from '../assets/sitex-logo.jpeg';

const ADMIN_USERNAME = 'sitexadmin';
const ADMIN_PASSWORD = 'sitexadmin';
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 60; // seconds

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockout, setLockout] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(LOCKOUT_TIME);
  const passwordRef = useRef(null);
  const usernameRef = useRef(null);
  React.useEffect(() => { usernameRef.current?.focus(); }, []);

  React.useEffect(() => {
    let timer;
    if (lockout && lockoutTimer > 0) {
      timer = setTimeout(() => setLockoutTimer(lockoutTimer - 1), 1000);
    } else if (lockout && lockoutTimer === 0) {
      setLockout(false);
      setAttempts(0);
      setLockoutTimer(LOCKOUT_TIME);
    }
    return () => clearTimeout(timer);
  }, [lockout, lockoutTimer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockout) return;
    setLoading(true);
    setError('');
    await new Promise((r) => setTimeout(r, 700)); // Simulate auth delay
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      sessionStorage.setItem('sitexadmin_logged_in', 'true');
      setLoading(false);
      onLogin();
    } else {
      setLoading(false);
      setError('Incorrect username or password');
      setShake(true);
      setPassword('');
      setAttempts((a) => a + 1);
      passwordRef.current?.focus();
      setTimeout(() => setShake(false), 500);
      if (attempts + 1 >= MAX_ATTEMPTS) {
        setLockout(true);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100">
      <div className={`w-full max-w-md p-8 bg-white rounded-2xl shadow-xl flex flex-col items-center transition-all duration-300 border-2 ${shake ? 'border-red-500 animate-shake' : 'border-slate-200'}`}
        style={{ gap: 32 }}>
        <img src={sitexLogo} alt="Sitex Logo" className="w-20 h-20 rounded-full shadow-md mb-2" />
        <h1 className="text-2xl font-bold text-blue-800 mb-1">Sitex Admin Portal</h1>
        <span className="text-blue-600 text-sm mb-4">Admin Access Only</span>
        <form className="w-full flex flex-col gap-6" onSubmit={handleSubmit} autoComplete="off">
          <div className="relative">
            <input
              ref={usernameRef}
              type="text"
              id="username"
              name="username"
              className={`peer w-full px-4 pt-6 pb-2 rounded-lg border-2 bg-blue-50 text-blue-900 focus:outline-none focus:border-blue-600 transition-all duration-200 ${error ? 'border-red-500' : 'border-slate-200'}`}
              value={username}
              onChange={e => setUsername(e.target.value)}
              disabled={loading || lockout}
              autoFocus
              required
            />
            <label htmlFor="username" className="absolute left-4 top-2 text-blue-500 text-xs transition-all duration-200 peer-focus:text-blue-600 peer-focus:top-1 peer-focus:text-xs peer-placeholder-shown:top-6 peer-placeholder-shown:text-base pointer-events-none">Username</label>
          </div>
          <div className="relative">
            <input
              ref={passwordRef}
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              className={`peer w-full px-4 pt-6 pb-2 rounded-lg border-2 bg-blue-50 text-blue-900 focus:outline-none focus:border-blue-600 transition-all duration-200 ${error ? 'border-red-500' : 'border-slate-200'}`}
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading || lockout}
              required
            />
            <label htmlFor="password" className="absolute left-4 top-2 text-blue-500 text-xs transition-all duration-200 peer-focus:text-blue-600 peer-focus:top-1 peer-focus:text-xs peer-placeholder-shown:top-6 peer-placeholder-shown:text-base pointer-events-none">Password</label>
            <button type="button" tabIndex={-1} className="absolute right-3 top-6 text-blue-400 hover:text-blue-600 transition-colors" onClick={() => setShowPassword(v => !v)} aria-label="Toggle password visibility">
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18M9.88 9.88A3 3 0 0112 9c1.657 0 3 1.343 3 3 0 .512-.13 1-.36 1.42M6.1 6.1A9.956 9.956 0 002 12c0 5.523 4.477 10 10 10 1.657 0 3.22-.403 4.575-1.125M15 12a3 3 0 01-6 0" /></svg>
              )}
            </button>
          </div>
          <button
            type="submit"
            className={`w-full py-3 rounded-lg font-semibold text-white bg-blue-800 hover:bg-blue-900 focus:bg-blue-900 transition-all duration-200 flex items-center justify-center gap-2 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed ${loading ? 'pointer-events-none' : ''}`}
            disabled={loading || lockout}
          >
            {loading && (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
            )}
            {lockout ? `Locked (${lockoutTimer}s)` : 'Sign In'}
          </button>
          {error && (
            <div className="text-red-500 text-sm text-center animate-pulse mt-1">{error}</div>
          )}
          {lockout && (
            <div className="text-emerald-500 text-xs text-center mt-1">Too many failed attempts. Please wait.</div>
          )}
        </form>
        <div className="w-full flex justify-between items-center mt-4">
          <span className="text-xs text-blue-400">© Sitex {new Date().getFullYear()}</span>
          <span className="text-xs text-emerald-500 font-semibold">Admin Only</span>
        </div>
      </div>
    </div>
  );
} 