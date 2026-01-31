import React, { useEffect } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { checkoutSubscription } from '../stripe';
import './Login.css';

const Login = ({ user, onSkipPayment }) => {
    // Check if user has paid based on URL or Firestore implementation in a real app
    // For this demo, we check if they just came back deeply from Stripe
    const query = new URLSearchParams(window.location.search);
    const isSuccess = query.get('success');
    const [error, setError] = React.useState(null);

    const handleSignIn = async () => {
        setError(null);
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err) {
            console.error("Error signing in: ", err);
            let errorMessage = "Failed to sign in.";
            if (err.code === 'auth/popup-closed-by-user') {
                errorMessage = "Sign-in popup was closed before completing.";
            } else if (err.code === 'auth/cancelled-popup-request') {
                errorMessage = "Multiple popups were opened.";
            } else if (err.code === 'auth/network-request-failed') {
                errorMessage = "Network error. Please check your connection.";
            } else if (err.code === 'auth/unauthorized-domain') {
                errorMessage = "Domain not authorized (check Firebase Console).";
            } else if (err.message) {
                errorMessage = err.message;
            }
            setError(errorMessage);
        }
    };

    const handleSubscribe = async () => {
        try {
            // Show loading state could be good here, but for now let's just use console
            const button = document.querySelector('.subscribe-btn');
            if (button) {
                button.textContent = "Processing...";
                button.disabled = true;
            }
            await checkoutSubscription();
        } catch (err) {
            console.error(err);
            alert("Payment Error: " + err.message);
            // Reset button
            const button = document.querySelector('.subscribe-btn');
            if (button) {
                button.textContent = "Subscribe Now ($20/mo)";
                button.disabled = false;
            }
        }
    };

    // If user is logged in BUT hasn't paid (conceptually), we show payment screen
    // In a real app, you'd check a 'subscriptionStatus' field on the user's Firestore document

    if (user && !isSuccess) {
        return (
            <div className="login-container">
                <div className="login-card">
                    <div className="login-logo">
                        <div className="logo-dot"></div>
                    </div>
                    <h1>Subscription Required</h1>
                    <p>Access FlowState Premium for just $20/month.</p>

                    <button onClick={handleSubscribe} className="subscribe-btn">
                        Subscribe Now ($20/mo)
                    </button>

                    <button onClick={onSkipPayment} className="text-btn">
                        No Thanks
                    </button>
                </div>
            </div>
        );
    }

    // If user is not logged in at all
    if (!user) {
        return (
            <div className="login-container">
                <div className="login-card">
                    <div className="login-logo">
                        <div className="logo-dot"></div>
                    </div>
                    <h1>Welcome to FlowState</h1>
                    <p>Premium Task Management for Professionals</p>

                    {error && (
                        <div className="error-message" style={{
                            color: '#ff6b6b',
                            marginBottom: '16px',
                            fontSize: '13px',
                            background: 'rgba(255,107,107,0.1)',
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,107,107,0.2)'
                        }}>
                            {error}
                        </div>
                    )}

                    <button onClick={handleSignIn} className="google-btn">
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
                        <span>Continue with Google</span>
                    </button>
                </div>
            </div>
        );
    }

    // If we reach here, user is logged in AND (conceptually) paid or just returned from payment
    return null;
};

export default Login;
