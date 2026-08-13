import { API_URL } from '../config/api';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setCredentials } from '../redux/slices/userSlice';
import toast from 'react-hot-toast'; // Assuming you have toast installed or use setMessage

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);

  // === NEW OTP STATES ===
  const [step, setStep] = useState(1); // 1: Register, 2: Verify OTP
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.user);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get('redirect') || '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();

    // STEP 1: REGISTER & SEND OTP
    if (step === 1) {
      if (password !== confirmPassword) {
        setMessage('Passwords do not match');
        return;
      } else {
        try {
          setLoading(true);
          // Standard register endpoint now sends OTP
          await axios.post(`${API_URL}/api/users`, { name, email, password });
          setLoading(false);
          setStep(2); // Move to OTP step
          setMessage(null);
          // Use toast if available, otherwise just UI update
          alert(`OTP sent to ${email}`);
        } catch (err) {
          setLoading(false);
          setMessage(err.response?.data?.message || err.message);
        }
      }
    }

    // STEP 2: VERIFY OTP
    else if (step === 2) {
      try {
        setLoading(true);
        const { data } = await axios.post(`${API_URL}/api/users/verify`, { email, otp });
        setLoading(false);
        dispatch(setCredentials({ ...data }));
        navigate(redirect);
      } catch (err) {
        setLoading(false);
        setMessage(err.response?.data?.message || 'Invalid OTP');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {step === 1 ? 'Create Account' : 'Verify Email'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 1 ? 'Join Nyoranix today' : `Enter the 6-digit code sent to ${email}`}
          </p>
        </div>

        {message && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm">{message}</div>}

        <form className="mt-8 space-y-6" onSubmit={submitHandler}>
          <div className="space-y-4">
            {step === 1 ? (
              <>
                <div>
                  <input type="text" required className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-blue-50" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <input type="email" required className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-blue-50" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <input type="password" required className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-blue-50" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div>
                  <input type="password" required className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-blue-50" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
              </>
            ) : (
              <div>
                <input
                  type="text"
                  required
                  maxLength="6"
                  className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 text-center text-xl tracking-widest focus:outline-none focus:ring-green-500 focus:border-green-500 bg-gray-50"
                  placeholder="X X X X X X"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            )}
          </div>

          <div>
            <button type="submit" disabled={loading} className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${step === 1 ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'}`}>
              {loading ? 'Processing...' : (step === 1 ? 'Send OTP' : 'Verify & Register')}
            </button>
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center mt-3 text-sm text-blue-600 hover:underline"
              >
                Change Email / Resend
              </button>
            )}
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to={redirect ? `/login?redirect=${redirect}` : '/login'} className="font-medium text-blue-600 hover:text-blue-500">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;