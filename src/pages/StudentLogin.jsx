import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function StudentLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // 👈 पासवर्ड दिखाने और छिपाने के लिए स्टेट
  
  // OTP Reset States
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false); // 👈 नए पासवर्ड के लिए स्टेट
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify & Reset

  const navigate = useNavigate();

  // 1. Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/v1/students/login', { email, password });
      localStorage.setItem('studentToken', res.data.token);
      localStorage.setItem('studentInfo', JSON.stringify(res.data.student));
      alert('✅ Login Successful!');
      navigate('/student-dashboard');
    } catch (err) {
      alert('❌ ' + (err.response?.data?.message || 'Login failed'));
    }
  };

  // 2. Request OTP for Forgot Password
  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/v1/students/forgot-password', { email });
      alert('✅ OTP sent to your email!');
      setStep(2);
    } catch (err) {
      alert('❌ ' + (err.response?.data?.message || 'Error sending OTP'));
    }
  };

  // 3. Reset Password with OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/v1/students/reset-password', { email, otp, newPassword });
      alert('✅ Password reset successfully! Please login with new password.');
      setIsForgot(false);
      setStep(1);
      setPassword('');
    } catch (err) {
      alert('❌ ' + (err.response?.data?.message || 'Reset failed'));
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }}>
        
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b', textAlign: 'center', marginBottom: '20px' }}>
          🎓 Student Portal
        </h2>

        {!isForgot ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Email ID</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Password (Default: 123456)</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '10px', paddingRight: '50px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#3b82f6', fontWeight: '600' }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button type="submit" style={{ padding: '10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
              Login
            </button>

            <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', cursor: 'pointer', marginTop: '10px' }} onClick={() => setIsForgot(true)}>
              Forgot Password?
            </p>
          </form>
        ) : (
          <div>
            {step === 1 ? (
              <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <p style={{ fontSize: '13px', color: '#64748b' }}>Enter your registered email to receive an OTP for password reset.</p>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Email ID</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
                  />
                </div>
                <button type="submit" style={{ padding: '10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
                  Send OTP
                </button>
                <p style={{ textAlign: 'center', fontSize: '13px', color: '#3b82f6', cursor: 'pointer' }} onClick={() => setIsForgot(false)}>
                  Back to Login
                </p>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <p style={{ fontSize: '13px', color: '#64748b' }}>Enter the OTP sent to your email and your new password.</p>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Enter OTP</label>
                  <input 
                    type="text" 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>New Password</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                    <input 
                      type={showNewPassword ? "text" : "password"} 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      required 
                      style={{ width: '100%', padding: '10px', paddingRight: '50px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#8b5cf6', fontWeight: '600' }}
                    >
                      {showNewPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <button type="submit" style={{ padding: '10px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
                  Reset Password
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
}