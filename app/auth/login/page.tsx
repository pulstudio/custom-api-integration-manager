'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import Image from 'next/image';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState('');

  useEffect(() => {
    const { data: authListener } = createClient().auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/dashboard');
      }
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [router]);

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setIsLoading(true);
    setError('');
    const supabase = createClient();
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message === 'Invalid login credentials' 
        ? 'Incorrect email or password. Try again or click "Forgot Password".' 
        : error.message);
    } else if (data.user) {
      router.push('/dashboard');
    }
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError('An error occurred during Google sign-in. Please try again.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const logout = urlParams.get('logout');
    if (logout === 'success') {
      setLogoutMessage('You have been successfully logged out.');
      setTimeout(() => setLogoutMessage(''), 3000);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        {logoutMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
            <p>{logoutMessage}</p>
          </div>
        )}
        <h1 className="text-3xl font-bold mb-2 text-center">Log in to Your Account</h1>
        <p className="text-gray-600 mb-8 text-center">Manage your integrations easily.</p>
        
        {!showEmailLogin ? (
          <>
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded mb-4 flex items-center justify-center hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              disabled={isLoading}
            >
              <Image src="/google-logo.png" alt="Google logo" width={20} height={20} className="mr-2" />
              Log In with Google
            </button>
            <button
              onClick={() => setShowEmailLogin(true)}
              className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              Log In with Email
            </button>
          </>
        ) : (
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        )}
        
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
        
        <div className="mt-4 text-center">
          <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
            Forgot Password?
          </Link>
        </div>
        
        {isLoading && (
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
}