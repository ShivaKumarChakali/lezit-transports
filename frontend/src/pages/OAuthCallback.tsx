import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const token = searchParams.get('token');
      const provider = searchParams.get('provider');
      const error = searchParams.get('error');

      if (error) {
        toast.error('OAuth authentication failed. Please try again.');
        navigate('/login');
        return;
      }

      if (token) {
        try {
          // Store the token and get user data
          await loginWithToken(token);
          toast.success(`Successfully signed in with ${provider}!`);
          navigate('/');
        } catch (error: any) {
          console.error('OAuth callback error:', error);
          toast.error('Failed to complete authentication. Please try again.');
          navigate('/login');
        }
      } else {
        toast.error('Authentication failed. Please try again.');
        navigate('/login');
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, loginWithToken]);

  return (
    <div className="oauth-callback-page">
      <div className="oauth-callback-container">
        <div className="oauth-callback-card">
          <div className="spinner"></div>
          <h2>Completing sign in...</h2>
          <p>Please wait while we complete your authentication.</p>
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback; 