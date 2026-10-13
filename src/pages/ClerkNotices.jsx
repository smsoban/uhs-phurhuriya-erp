import { useState } from 'react';
import ClerkSidebar from './ClerkSidebar';

export default function ClerkNotices() {
  const [notices, setNotices] = useState([
    {
      id: 1,
      title: 'वार्षिक परीक्षा 2026 की तिथि घोषणा',
      description: 'कक्षा 9वीं और 11वीं की वार्षिक परीक्षाएं 15 मार्च 2026 से शुरू होंगी। सभी छात्र समय पर अपना प्रवेश पत्र प्राप्त कर लें।',
      category: 'Exam',
      date: '2026-03-01',
      postedBy: 'Clerk Office'
    },
    {
      id: 2,
      title: 'फीस जमा करने की अंतिम तिथि',
      description: 'चालू सत्र की मासिक ट्यूशन फीस जमा करने की अंतिम तिथि 10 तारीख है। विलम्ब शुल्क से बचने के लिए समय पर भुगतान करें।',
      category: 'Fees',
      date: '2026-03-05',
      postedBy: 'Accounts Section'
    }
  ]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');

  const handleAddNotice = (e) => {
    e.preventDefault();
    if (!title || !description) {
      alert('⚠️ कृपया नोटिस का शीर्षक और विवरण भरें!');
      return;
    }

    const newNotice = {
      id: Date.now(),
      title,
      description,
      category,
      date: new Date().toISOString().split('T')[0],
      postedBy: 'Clerk Office'
    };

    setNotices([newNotice, ...notices]);
    setTitle('');
    setDescription('');
    alert('✅ नोटिस सफलतापूर्वक प्रकाशित कर दिया गया है!');
  };

  const handleDeleteNotice = (id) => {
    if (window.confirm('क्या आप इस नोटिस को हटाना चाहते हैं?')) {
      setNotices(notices.filter(n => n.id !== id));
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      {/* क्लर्क साइडबार */}
      <ClerkSidebar />

      {/* मुख्य कंटेंट */}
      <div style={{ flex: 1, padding: '30px', fontFamily: 'Segoe UI', overflowY: 'auto' }}>
        <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
          <h1 style={{ margin: '0 0 5px 0', color: '#1e293b', fontSize: '24px' }}>📢 Office Notices & Circulars</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>स्कूल के लिए नए नोटिस जारी करें और पुराने सर्कुलर मैनेज करें।</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '25px', alignItems: 'start' }}>
          
          {/* नोटिस जोड़ने का फॉर्म */}
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#1e293b', fontSize: '16px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>Publish New Notice</h3>
            
            <form onSubmit={handleAddNotice} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>NOTICE TITLE</label>
                <input 
                  type="text" 
                  placeholder="Enter title..." 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>CATEGORY</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff', boxSizing: 'border-box' }}
                >
                  <option value="General">General / सूचना</option>
                  <option value="Fees">Fees / फीस संबंधी</option>
                  <option value="Exam">Exam / परीक्षा</option>
                  <option value="Holiday">Holiday / अवकाश</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>DESCRIPTION / DETAILS</label>
                <textarea 
                  rows="4"
                  placeholder="Enter notice details..." 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <button 
                type="submit"
                style={{ padding: '10px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', marginTop: '5px' }}
              >
                Publish Notice
              </button>
            </form>
          </div>

          {/* एक्टिव नोटिस बोर्ड लिस्ट */}
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#1e293b', fontSize: '16px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>Active Notice Board</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {notices.length > 0 ? (
                notices.map((notice) => (
                  <div key={notice.id} style={{ border: '1px solid #e2e8f0', padding: '15px', borderRadius: '8px', backgroundColor: '#f8fafc', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ backgroundColor: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                        {notice.category}
                      </span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>📅 {notice.date}</span>
                    </div>
                    <h4 style={{ margin: '0 0 6px 0', color: '#1e293b', fontSize: '15px' }}>{notice.title}</h4>
                    <p style={{ margin: '0 0 10px 0', color: '#334155', fontSize: '13px', lineHeight: '1.5' }}>{notice.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '8px', fontSize: '11px', color: '#64748b' }}>
                      <span>✍️ Posted by: {notice.postedBy}</span>
                      <button 
                        onClick={() => handleDeleteNotice(notice.id)}
                        style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '11px' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>कोई सक्रिय नोटिस उपलब्ध नहीं है।</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}