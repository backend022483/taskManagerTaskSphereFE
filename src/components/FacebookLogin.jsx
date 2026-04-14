import React, { useState } from 'react';

const FacebookLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login attempt:', formData);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24">
          
          {/* Left Column - Branding */}
          <div className="flex-1 max-w-md text-center lg:text-left">
            <h1 className="text-5xl lg:text-6xl font-bold text-blue-600 mb-4">
              facebook
            </h1>
            <p className="text-xl lg:text-2xl text-gray-800 leading-relaxed">
              Connect with friends and the world around you on Facebook.
            </p>
          </div>

          {/* Right Column - Authentication Card */}
          <div className="w-full max-w-md">
            <div className="bg-white shadow-lg rounded-lg p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  name="email"
                  placeholder="Email or phone number"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Log In
                </button>

                <div className="text-center">
                  <a href="#" className="text-blue-600 hover:underline text-sm">
                    Forgotten password?
                  </a>
                </div>

                <div className="border-t border-gray-300 pt-4">
                  <button
                    type="button"
                    className="w-full bg-green-600 text-white font-bold py-3 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Create new account
                  </button>
                </div>
              </form>
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                <a href="#" className="font-semibold hover:underline">
                  Create a Page
                </a>
                {' '}for a celebrity, brand or business.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FacebookLogin;
