import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, password: string) => void;
}

// Define a type for our users
interface User {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
}

// Create an array of users
const USERS: User[] = [
  {
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin'
  },
  {
    email: 'brice.dubois@etail-agency.com',
    password: 'brice123',
    name: 'Brice Dubois',
    role: 'user'
  }
];

export function LoginPage({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:8005/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const userData = await response.json();
      onLogin(email, password);
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 py-12 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: `url("https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2832&auto=format&fit=crop")`
      }}
    >
      <div className="max-w-md w-full space-y-8 p-10 rounded-xl backdrop-blur-sm bg-white/30 dark:bg-gray-900/30 shadow-xl border border-white/20">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-white">
            Image Resizer Pro
          </h2>
          <p className="mt-2 text-center text-sm text-gray-100">
            Sign in to access your workspace
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-100 bg-red-500/40 text-sm text-center p-2 rounded-lg backdrop-blur-sm">
              {error}
            </div>
          )}
          <div className="rounded-md space-y-4">
            <div className="relative">
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-100" />
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-10 py-3 border border-white/30 placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent sm:text-sm bg-white/10 backdrop-blur-sm"
                placeholder="Email address"
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-100" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-10 py-3 border border-white/30 placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent sm:text-sm bg-white/10 backdrop-blur-sm"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-100 hover:text-white focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-white/30 bg-white/10 backdrop-blur-sm focus:ring-2 focus:ring-white/50"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-100">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <button
                type="button"
                onClick={() => setShowCredentials(!showCredentials)}
                className="font-medium text-gray-100 hover:text-white"
              >
                Show available users
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-white/20 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 transition-all duration-200 backdrop-blur-sm"
            >
              Sign in
            </button>
          </div>

          {showCredentials && (
            <div className="mt-4 p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/30">
              <h3 className="text-white font-medium mb-2">Available Users:</h3>
              <div className="space-y-2">
                {USERS.map((user) => (
                  <div key={user.email} className="text-sm text-gray-100">
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Password:</strong> {user.password}</p>
                    <p><strong>Role:</strong> {user.role}</p>
                    <hr className="border-white/20 my-2" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
} 