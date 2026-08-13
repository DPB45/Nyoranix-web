import { API_URL } from '../config/api';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { setCredentials } from '../redux/slices/userSlice';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: request OTP, 2: reset password
  const [message, setMessage] = useState(null);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const requestOtp = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/api/users/forgot-password`, { email });
      setLoading(false);
      setInfo(data.message || `A reset code has been sent to ${email}`);
      setStep(2);
    } catch (err) {
      setLoading(false);
      setMessage(err.response?.data?.message || err.message);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/api/users/reset-password`, { email, otp, password });
      setLoading(false);
      dispatch(setCredentials({ ...data }));
      navigate('/');
    } catch (err) {
      setLoading(false);
      setMessage(err.response?.data?.message || 'Invalid or expired code');
    }
  };

  const resendOtp = async () => {
    setMessage(null);
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/api/users/forgot-password`, { email });
      setLoading(false);
      setInfo(data.message || `A new code has been sent to ${email}`);
    } catch (err) {
      setLoading(false);
      setMessage(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {step === 1 ? 'Forgot Password' : 'Reset Password'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 1
              ? "Enter your account email and we'll send you a reset code."
              : `Enter the 6-digit code sent to ${email} and choose a new password.`}
          </p>
        </div>

        {message && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm">{message}</div>}
        {info && step === 2 && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative text-sm">{info}</div>}

        {step === 1 ? (
          <form className="mt-8 space-y-6" onSubmit={requestOtp}>
            <input
              type="email"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-blue-50"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={resetPassword}>
            <input
              type="text"
              required
              maxLength="6"
              className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 text-center text-xl tracking-widest focus:outline-none focus:ring-green-500 focus:border-green-500 bg-gray-50"
              placeholder="X X X X X X"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <input
              type="password"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-blue-50"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-blue-50"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {loading ? 'Processing...' : 'Reset Password'}
            </button>
            <button
              type="button"
              onClick={resendOtp}
              disabled={loading}
              className="w-full text-center text-sm text-blue-600 hover:underline"
            >
              Resend Code
            </button>
          </form>
        )}

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Remembered your password?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;