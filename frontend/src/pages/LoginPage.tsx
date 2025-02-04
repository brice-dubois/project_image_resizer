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
        <div className="text-center flex flex-col items-center">
          <canvas
            id="logoCanvas"
            className="absolute inset-0 w-full h-full rounded-xl"
            ref={(canvas) => {
              if (canvas) {
                // Set canvas size to match parent div
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
                
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  // Set up particles
                  const particles: {
                    x: number;
                    y: number;
                    radius: number;
                    speed: number;
                    opacity: number;
                  }[] = [];
                  const particleCount = 75;
                  
                  for (let i = 0; i < particleCount; i++) {
                    particles.push({
                      x: Math.random() * canvas.width,
                      y: -10, // Start above canvas
                      radius: Math.random() * 3 + 1,
                      speed: Math.random() * 0.5 + 0.2, // Reduced speed range from 1-3 to 0.2-0.7
                      opacity: Math.random()
                    });
                  }

                  // Animation loop
                  const animate = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    
                    // Draw and update particles
                    particles.forEach(particle => {
                      ctx.beginPath();
                      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                      // Randomly choose between white and light blue
                      const color = Math.random() < 0.5 ? 
                        `rgba(255, 255, 255, ${particle.opacity})` :
                        `rgba(173, 216, 230, ${particle.opacity})`;
                      ctx.fillStyle = color;
                      ctx.fill();
                      
                      // Move particle down
                      particle.y += particle.speed;
                      
                      // Reset particle if it goes off screen
                      if (particle.y > canvas.height) {
                        particle.y = -10;
                        particle.x = Math.random() * canvas.width;
                      }
                    });

                    requestAnimationFrame(animate);
                  };

                  animate();
                }
              }
            }}
          />
          <div className="relative z-10">
            <h2 className="mt-2 text-3xl font-extrabold text-white">
              Image Resizer
            </h2>
            <p className="mt-2 text-sm text-gray-100">
              Sign in to access your workspace
            </p>
          </div>
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

          <div>
            <button
              type="submit"
              className="group relative w-full flex mt-10 justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-white/20 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 transition-all duration-200 backdrop-blur-sm"
            >
              Sign in
            </button>
          </div>

        </form>
      </div>
    </div>
  );
} 