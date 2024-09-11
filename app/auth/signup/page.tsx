'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import zxcvbn from 'zxcvbn';

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

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
    if (!re.test(email)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
    } else if (!/\d/.test(password) || !/[!@#$%^&*]/.test(password)) {
      setPasswordError('Password must include numbers and symbols');
    } else {
      setPasswordError('');
    }
    const result = zxcvbn(password);
    setPasswordStrength(result.score);
  };

  const handleSignUp = async () => {
    if (!emailError && !passwordError) {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        console.error('Error signing up:', error);
      } else {
        router.push('/dashboard');
      }
    }
  };

  const handleGoogleSignUp = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.error('Error signing up with Google:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Create Your Account</h1>
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => {/* Show email form */}}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Sign Up with Email
          </button>
          <button
            onClick={handleGoogleSignUp}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
          >
            Sign Up with Google
          </button>
        </div>
        <input
          className="w-full mb-4 p-2 border border-gray-300 rounded"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            validateEmail(e.target.value);
          }}
        />
        {emailError && <p className="text-red-500 mb-4">{emailError}</p>}
        <input
          className="w-full mb-4 p-2 border border-gray-300 rounded"
          placeholder="Create a password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            validatePassword(e.target.value);
          }}
        />
        {passwordError && <p className="text-red-500 mb-4">{passwordError}</p>}
        <div className="mb-4">
          <div className="h-2 bg-gray-200 rounded">
            <div
              className={`h-full rounded ${
                passwordStrength === 0 ? 'bg-red-500' :
                passwordStrength === 1 ? 'bg-orange-500' :
                passwordStrength === 2 ? 'bg-yellow-500' :
                passwordStrength === 3 ? 'bg-green-500' :
                'bg-green-600'
              }`}
              style={{ width: `${(passwordStrength + 1) * 20}%` }}
            ></div>
          </div>
          <p className="text-sm mt-1">
            {passwordStrength === 0 ? 'Weak' :
             passwordStrength === 1 ? 'Fair' :
             passwordStrength === 2 ? 'Good' :
             passwordStrength === 3 ? 'Strong' :
             'Very Strong'}
          </p>
        </div>
        <button
          onClick={handleSignUp}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}