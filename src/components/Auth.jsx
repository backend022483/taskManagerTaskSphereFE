import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

const Auth = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);

  const handleLogin = (userData) => {
    onAuth(userData);
  };

  const handleRegister = (userData) => {
    onAuth(userData);
  };

  const switchToRegister = () => {
    setIsLogin(false);
  };

  const switchToLogin = () => {
    setIsLogin(true);
  };

  return (
    <>
      {isLogin ? (
        <Login 
          onLogin={handleLogin} 
          onSwitchToRegister={switchToRegister} 
        />
      ) : (
        <Register 
          onRegister={handleRegister} 
          onSwitchToLogin={switchToLogin} 
        />
      )}
    </>
  );
};

export default Auth;
