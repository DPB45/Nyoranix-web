import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from './config/api';
import { logout } from './redux/slices/userSlice';

// If the API says our login is no longer valid (token expired after 30 days, or
// the account was deleted), sign out and send the user to the login page instead
// of leaving every page throwing silent errors.
let handling = false;

export const setupAxios = (store) => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const url = String(error?.config?.url || '');
      const isOurApi = url.startsWith(API_URL);
      const method = String(error?.config?.method || '').toLowerCase();
      // Login/OTP/reset forms, and registration (POST /api/users). A GET on
      // /api/users is the admin user list and must still sign out on 401.
      const isAuthForm = /\/api\/users\/(login|verify|resend-otp|reset-password|forgot-password)$/.test(url)
        || (method === 'post' && /\/api\/users$/.test(url));
      const hadToken = Boolean(error?.config?.headers?.Authorization);

      if (error?.response?.status === 401 && isOurApi && !isAuthForm && hadToken && store.getState().user.userInfo && !handling) {
        handling = true;
        store.dispatch(logout());
        toast.error('Your session has expired. Please log in again.');
        const here = window.location.pathname + window.location.search;
        window.location.assign(`/login?redirect=${encodeURIComponent(here)}`);
        setTimeout(() => { handling = false; }, 2000);
      }
      return Promise.reject(error);
    }
  );
};
