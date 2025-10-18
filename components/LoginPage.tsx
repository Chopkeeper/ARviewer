import React, { useState } from 'react';
import { api } from '../api';
import { LogoIcon } from './Icons';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const success = await api.login(username, password);
    setIsLoading(false);
    if (success) {
      onLoginSuccess();
    } else {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
            <LogoIcon />
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-gray-700">
            <h1 className="text-2xl font-bold text-center text-white mb-2">Admin Dashboard</h1>
            <p className="text-center text-gray-400 mb-6">กรุณาเข้าสู่ระบบเพื่อจัดการเนื้อหา AR</p>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="username">
                  ชื่อผู้ใช้ (admin)
                </label>
                <input
                  className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 bg-gray-700 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="password">
                  รหัสผ่าน (password)
                </label>
                <input
                  className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 bg-gray-700 text-gray-200 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  id="password"
                  type="password"
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
              <div className="flex items-center justify-center">
                <button
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors disabled:bg-gray-500"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                </button>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
