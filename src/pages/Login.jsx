import { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import schoolLogo from '../assets/LOGO1.JPG';
import schoolPhoto from '../assets/SCHOOL_PHOTO.jpg';

export default function Login() {
  const [loginType, setLoginType] = useState('staff'); // 'staff' या 'student'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      if (loginType === 'staff') {
        const res = await axios.post('/api/v1/auth/login', {
          username: email,
          password
        });
        
        login(res.data.user, res.data.token);
        alert('✅ Staff Login Successful!');

        const userData = res.data.user;
        const roleData = userData?.role;
        let roleName = '';

        if (typeof roleData === 'string') {
          roleName = roleData.trim();
        } else if (typeof roleData === 'object' && roleData !== null) {
          roleName = (roleData.name || roleData.code || roleData.title || '').trim();
        }

        const lowerRole = roleName.toLowerCase();

        setTimeout(() => {
          if (lowerRole.includes('teacher')) {
            navigate('/teacher-dashboard', { replace: true });
          } else if (lowerRole === 'clerk' || lowerRole.includes('clerk') || lowerRole.includes('clk')) {
            navigate('/clerk-dashboard', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        }, 100);

      } else {
        const res = await axios.post('/api/v1/students/login', { 
          email, 
          password 
        });

        const studentUser = { 
          ...res.data.student, 
          role: 'student' 
        };

        login(studentUser, res.data.token);

        localStorage.setItem('studentToken', res.data.token);
        localStorage.setItem('studentInfo', JSON.stringify(res.data.student));
        alert('✅ Student Login Successful!');

        setTimeout(() => {
          navigate('/student-dashboard', { replace: true });
        }, 100);
      }

    } catch (err) {
      alert('❌ Login Failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      backgroundImage: `url(${schoolPhoto})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', 
      padding: '20px' 
    }}>
      {/* Glassmorphism Box */}
      <div style={{ 
        width: '100%', 
        maxWidth: '420px', 
        background: 'rgba(255, 255, 255, 0.45)', 
        backdropFilter: 'blur(12px)', 
        WebkitBackdropFilter: 'blur(12px)',
        padding: '35px 30px', 
        borderRadius: '16px', 
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)', 
        border: '1px solid rgba(255, 255, 255, 0.6)',
        textAlign: 'center',
        position: 'relative',
        marginTop: '55px' 
      }}>
        
        {/* बड़ा लोगो (बिना बॉर्डर के) */}
        <div style={{ 
          position: 'absolute', 
          top: '-55px', 
          left: '50%', 
          transform: 'translateX(-50%)',
          width: '110px', 
          height: '110px', 
          borderRadius: '50%', 
          backgroundColor: '#fff', 
          boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden'
        }}>
          <img src={schoolLogo} alt="School Logo" style={{ width: '138%', height: '138%', objectFit: 'cover' }} />
        </div>

        {/* Heading */}
        <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#1e293b', margin: '45px 0 5px 0' }}>
          +2 उच्चतर माध्यमिक विद्यालय
        </h2>
        <p style={{ fontSize: '13px', fontWeight: '700', color: '#7f1d1d', margin: '0 0 20px 0', letterSpacing: '0.5px' }}>
          STAFF & STUDENT PORTAL
        </p>

        {/* Login Type Switcher Tabs */}
        <div style={{ display: 'flex', backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '8px', padding: '4px', marginBottom: '20px' }}>
          <button 
            type="button"
            onClick={() => setLoginType('staff')}
            style={{ 
              flex: 1, padding: '8px', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
              backgroundColor: loginType === 'staff' ? '#991b1b' : 'transparent',
              color: loginType === 'staff' ? '#fff' : '#334155',
              transition: '0.3s'
            }}
          >
            Staff / Admin
          </button>
          <button 
            type="button"
            onClick={() => setLoginType('student')}
            style={{ 
              flex: 1, padding: '8px', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
              backgroundColor: loginType === 'student' ? '#991b1b' : 'transparent',
              color: loginType === 'student' ? '#fff' : '#334155',
              transition: '0.3s'
            }}
          >
            Student
          </button>
        </div>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
          
          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase' }}>
              {loginType === 'staff' ? 'Staff ID / Email ID' : 'Student Email '}
            </label>
            <div style={{ position: 'relative', marginTop: '5px' }}>
              <span style={{ position: 'absolute', left: '12px', top: '11px', fontSize: '15px' }}>👤</span>
              <input 
                type="text" 
                placeholder={loginType === 'staff' ? 'Enter staff ID' : 'Enter student email-ID'}
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.8)', background: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', boxSizing: 'border-box', outline: 'none', color: '#1e293b', fontWeight: '600' }}
              />
            </div>
          </div>
          
          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase' }}>Password</label>
            <div style={{ position: 'relative', marginTop: '5px' }}>
              <span style={{ position: 'absolute', left: '12px', top: '11px', fontSize: '15px' }}>🔒</span>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                style={{ width: '100%', padding: '10px 40px 10px 38px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.8)', background: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', boxSizing: 'border-box', outline: 'none', color: '#1e293b', fontWeight: '600' }}
              />
              
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '10px', top: '10px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            style={{ width: '100%', padding: '11px', backgroundColor: '#991b1b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', marginTop: '5px', boxShadow: '0 4px 12px rgba(153, 27, 27, 0.3)' }}
          >
            Login to Portal
          </button>
        </form>

        <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600' }}>
          <a href="#" style={{ color: '#7f1d1d', textDecoration: 'none' }}>Forgot Password?</a>
        
        </div>

        <div style={{ marginTop: '22px', fontSize: '11px', color: '#475569', borderTop: '1px solid rgba(255,255,255,0.4)', paddingTop: '12px', fontWeight: '600' }}>
          © 2026 UHS Phurhuriya. All rights reserved.
        </div>
      </div>
    </div>
  );
}