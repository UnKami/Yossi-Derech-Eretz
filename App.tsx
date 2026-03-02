import React, { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import PublicHome from './components/PublicHome';
import MemberHub from './components/MemberHub';
import { User } from './types';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

// PayPal Client ID provided by user
const PAYPAL_CLIENT_ID = "AYOHHBVLVqB9EfOeZ31IkyejwW1k48gPl0OocLOwHszxMXd3vQnDdAhQ7cAEZgv13Q1jxocLQXjb_VS7";

// -------------------------------------------------------------------------
// IMPORTANT: Replace this with your actual Google Client ID from Google Cloud Console
// https://console.cloud.google.com/apis/credentials
// -------------------------------------------------------------------------
const GOOGLE_CLIENT_ID = "185985561940-mkmru180hfvmdd53msl7fv6v6jslligt.apps.googleusercontent.com"; 

function App() {
  const [user, setUser] = useState<User | null>(null);

  // PayPal Configuration
  const initialPayPalOptions = {
    clientId: PAYPAL_CLIENT_ID,
    currency: "ILS",
    intent: "capture",
    components: "buttons",
    "data-sdk-integration-source": "button-factory",
  };

  const handleLoginSuccess = (credentialResponse: any) => {
    try {
      if (credentialResponse.credential) {
        const decoded: any = jwtDecode(credentialResponse.credential);
        
        // Map Google profile to our User type
        const realUser: User = {
          id: decoded.sub,
          name: decoded.name,
          email: decoded.email,
          avatar: decoded.picture
        };
        
        setUser(realUser);
      }
    } catch (error) {
      console.error("Login Failed:", error);
    }
  };

  const handleLoginError = () => {
    console.error("Google Login Failed");
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <PayPalScriptProvider options={initialPayPalOptions}>
          {user ? (
              <MemberHub user={user} onLogout={handleLogout} />
          ) : (
              <PublicHome 
                onLoginSuccess={handleLoginSuccess} 
                onLoginError={handleLoginError} 
              />
          )}
      </PayPalScriptProvider>
    </GoogleOAuthProvider>
  );
}

export default App;