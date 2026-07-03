import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, Terminal } from 'lucide-react';
import { loginUser } from "../api/auth.api";

interface LoginGatewayProps {
  onLogin: (username: string) => void;
}

export default function LoginGateway({ onLogin }: LoginGatewayProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    setError("");

    try {

      const data = await loginUser( username, password );

      console.log(data);

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "role",
        data.user.role
      );

      localStorage.setItem(
        "userId",
        data.user.id
      );

      localStorage.setItem(
        "employeeId",
        data.user.employeeId ?? ""
      );

      onLogin(JSON.stringify(data.user));

    } catch (error: any) {

      setError(
        error?.response?.data?.message ||
        "Login failed"
      );

    }

  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#121212] px-4 font-sans selection:bg-[#30363d]">
      <div className="w-full max-w-md bg-[#1e1e1e] border border-[#30363d] rounded-xl p-8 shadow-2xl">
        {/* Branding header / Humble label */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#121212] border border-[#30363d] text-[#c9d1d9] mb-4">
            <Terminal className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h1 className="text-xl font-medium tracking-tight text-[#c9d1d9]">
            Timesheet & Salary Engine
          </h1>
          <p className="text-sm text-[#8b949e] mt-2">
            Muted dark-theme workforce utility gateway
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="username-input" className="block text-xs font-medium uppercase tracking-wider text-[#8b949e]">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#8b949e]">
                <User className="w-4 h-4" />
              </span>
              <input
                id="username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-10 pr-4 py-2.5 bg-[#121212] border border-[#30363d] rounded-lg text-sm text-[#c9d1d9] placeholder-[#8b949e]/55 focus:outline-none focus:border-[#8b949e]/80 transition duration-150"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password-input" className="block text-xs font-medium uppercase tracking-wider text-[#8b949e]">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#8b949e]">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-[#121212] border border-[#30363d] rounded-lg text-sm text-[#c9d1d9] placeholder-[#8b949e]/55 focus:outline-none focus:border-[#8b949e]/80 transition duration-150"
              />
              <button
                id="toggle-password-btn"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8b949e] hover:text-[#c9d1d9] transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="w-full py-2.5 bg-[#30363d] hover:bg-[#444d56] text-[#c9d1d9] rounded-lg text-sm font-medium border border-[#444d56] transition duration-150 cursor-pointer text-center"
          >
            Authenticate Credentials
          </button>
        </form>
      </div>
    </div>
  );
}
