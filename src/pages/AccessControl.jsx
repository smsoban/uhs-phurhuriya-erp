import React, { useState, useEffect } from 'react';
import axios from 'axios';

// उपलब्ध परमीशन्स की सूची
const AVAILABLE_PERMISSIONS = [
  { key: 'student-add', label: 'Add Student' },
  { key: 'student-update', label: 'Update Student' },
  { key: 'student-delete', label: 'Delete Student' }
];

export default function AccessControl() {
  const [usersList, setUsersList] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // स्टेट्स ट्रैक करने के लिए
  const [selectedRoles, setSelectedRoles] = useState({});
  const [userPermissions, setUserPermissions] = useState({}); // { userId: ['student-add', ...] }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // 1. टीचर्स/स्टाफ का डेटा फेच करें (अब इसमें डेटाबेस से परमीशन्स भी आएंगे)
      try {
        const teachersRes = await axios.get('/api/v1/teachers', { headers });
        const users = teachersRes.data.data || teachersRes.data || [];
        setUsersList(users);

        const initialRoles = {};
        const initialPerms = {};
        users.forEach(user => {
          initialRoles[user._id] = user.role?.name || user.role || '';
          // 💡 बैकएंड से आने वाली परमीशन्स एरे को यहाँ सेट किया जा रहा है
          initialPerms[user._id] = user.permissions || [];
        });
        setSelectedRoles(initialRoles);
        setUserPermissions(initialPerms);

      } catch (err) {
        console.error('❌ Error fetching teachers:', err);
      }

      // 2. रोल्स का डेटा फेच करें
      try {
        const rolesRes = await axios.get('/api/v1/roles', { headers });
        setRolesList(rolesRes.data.data || rolesRes.data || []);
      } catch (err) {
        console.warn('⚠️ Roles API not found, using default roles.');
        setRolesList([
          { _id: 'Admin', name: 'Admin' },
          { _id: 'Headmaster', name: 'Headmaster' },
          { _id: 'Teacher', name: 'Teacher' },
          { _id: 'Clerk', name: 'Clerk' },
          { _id: 'Staff', name: 'Staff' }
        ]);
      }
    } catch (err) {
      console.error('Critical Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 💡 रोल सिलेक्ट चेंज हैंडलर
  const handleRoleSelectChange = (userId, newRole) => {
    setSelectedRoles(prev => ({ ...prev, [userId]: newRole }));
  };

  // 💡 रोल अपडेट करने का एपीआई कॉल
  const handleAuthorityChange = async (userId) => {
    const newRoleId = selectedRoles[userId];
    if (!newRoleId) {
      alert('⚠️ कृपया पहले कोई रोल चुनें!');
      return;
    }

    if (!window.confirm('क्या आप वाकई इस स्टाफ का रोल अपडेट करना चाहते हैं?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/v1/teachers/update-access', 
        { userId, newRoleId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('✅ स्टाफ का रोल सफलतापूर्वक अपडेट कर दिया गया है!');
      fetchData();
    } catch (err) {
      alert('❌ एरर: ' + (err.response?.data?.message || err.message));
    }
  };

  // 💡 परमिशन चेकबॉक्स टॉगल और तुरंत डेटाबेस अपडेट
  const handlePermissionToggle = async (userId, permissionKey, isChecked) => {
    try {
      const token = localStorage.getItem('token');
      const type = isChecked ? 'GRANT' : 'REVOKE';

      // बैकएंड कॉल
      await axios.put('/api/v1/teachers/update-permissions', 
        { userId, permissionKey, type }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // लोकल स्टेट अपडेट करें ताकि तुरंत UI में टिक दिखे
      setUserPermissions(prev => {
        const currentPerms = prev[userId] || [];
        const updatedPerms = isChecked 
          ? [...currentPerms, permissionKey]
          : currentPerms.filter(p => p !== permissionKey);
        return { ...prev, [userId]: updatedPerms };
      });

    } catch (err) {
      alert('❌ परमिशन अपडेट करने में एरर: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ padding: '30px 40px', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f1f5f9', minHeight: '100vh' }}>
      <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>🔐 User Authority & Fine-Grained Permissions</h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
          यहाँ से एडमिन स्टाफ का रोल अपडेट करने के साथ-साथ विशेष ऐक्शन (जैसे Add, Update, Delete) की अनुमतियाँ भी दे या हटा सकता है।
        </p>

        {loading ? (
          <p style={{ color: '#64748b' }}>डेटा लोड हो रहा है...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '14px' }}>
                <th style={{ padding: '12px' }}>Staff Name & Details</th>
                <th style={{ padding: '12px' }}>Current Role</th>
                <th style={{ padding: '12px' }}>Manage Role & Action Permissions</th>
              </tr>
            </thead>
            <tbody>
              {usersList.length > 0 ? (
                usersList.map((user) => {
                  const currentRole = selectedRoles[user._id];
                  const isAdminOrHeadmaster = currentRole === 'Admin' || currentRole === 'Headmaster';

                  return (
                    <tr key={user._id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px', color: '#334155' }}>
                      <td style={{ padding: '12px', fontWeight: '600', verticalAlign: 'top' }}>
                        {user.name}
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'normal' }}>
                          {user.email ? `Email: ${user.email}` : ''} {user.eshikshakoshId ? `| ID: ${user.eshikshakoshId}` : ''}
                        </div>
                      </td>
                      <td style={{ padding: '12px', verticalAlign: 'top' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', backgroundColor: '#dcfce7', color: '#166534' }}>
                          {user.role?.name || user.role || 'Teacher'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {/* रोल चेंज करने का सेक्शन */}
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                          <select 
                            value={currentRole || ''} 
                            onChange={(e) => handleRoleSelectChange(user._id, e.target.value)}
                            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                          >
                            <option value="" disabled>-- Role चुनें --</option>
                            {rolesList.map(role => (
                              <option key={role._id} value={role.name}>
                                {role.name}
                              </option>
                            ))}
                          </select>

                          <button 
                            onClick={() => handleAuthorityChange(user._id)}
                            style={{ padding: '6px 12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}
                          >
                            Update Role
                          </button>
                        </div>

                        {/* कंडीशनल रेंडरिंग: Admin/Headmaster के लिए फुल एक्सेस मेसेज, बाकी के लिए चेकबॉक्स */}
                        {isAdminOrHeadmaster ? (
                          <div style={{ fontSize: '12px', color: '#166534', backgroundColor: '#dcfce7', padding: '8px 12px', borderRadius: '6px', fontWeight: '600', display: 'inline-block' }}>
                            ✨ इस रोल के पास सिस्टम के सभी अधिकार (Full Access) पहले से मौजूद हैं।
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '15px', backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Permissions:</span>
                            {AVAILABLE_PERMISSIONS.map(perm => {
                              const isChecked = userPermissions[user._id]?.includes(perm.key);
                              return (
                                <label key={perm.key} style={{ fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: '#334155' }}>
                                  <input 
                                    type="checkbox"
                                    checked={isChecked || false}
                                    onChange={(e) => handlePermissionToggle(user._id, perm.key, e.target.checked)}
                                  />
                                  {perm.label}
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>कोई स्टाफ रिकॉर्ड नहीं मिला।</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}