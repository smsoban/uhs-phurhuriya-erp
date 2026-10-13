import { useState } from 'react';
import { noticesForAudience, queriesForUser, schoolDate } from './communicationRules';

export function NoticeWorkspace({role, data, update, notify, PageTitle, Modal}) {
  const manage = ['admin', 'headmaster'].includes(role);
  const [draft, setDraft] = useState(null);
  const [filter, setFilter] = useState('All');
  const rows = noticesForAudience(data.notices, role).filter(item => filter === 'All' || (item.status || 'Published') === filter);
  const save = (event, status) => {
    event.preventDefault();
    if (!manage || !draft?.title.trim() || !draft?.body.trim()) return notify('Enter a title and message.');
    const item = {...draft, id:draft.id || `NOTICE-${crypto.randomUUID()}`, title:draft.title.trim(), body:draft.body.trim(), status, date:schoolDate(), updatedBy:role};
    update('notices', items => draft.id ? items.map(row => row.id === draft.id ? item : row) : [item, ...items], {action:draft.id?'UPDATE':'INSERT',record:item.title,detail:`Notice ${status.toLowerCase()} for ${item.audience}`});
    setDraft(null); notify(status === 'Draft' ? 'Notice draft saved' : 'Notice published');
  };
  const field = (key, value) => setDraft(current => ({...current, [key]:value}));
  return <>
    <PageTitle title="Notices" body={manage?'Create, edit and publish school announcements.':'School announcements for you.'} actions={manage&&<button className="btn btn-primary" onClick={()=>setDraft({title:'',body:'',tag:'General',audience:'Everyone',status:'Draft'})}>+ Create notice</button>}/>
    {manage&&<div className="filter-tabs">{['All','Published','Draft'].map(value=><button key={value} className={filter===value?'active':''} onClick={()=>setFilter(value)}>{value}</button>)}</div>}
    <div className="portal-notice-grid">{rows.map(item=><article key={item.id}><div><span className="tag">{item.tag}</span><time>{item.date}</time></div><h3>{item.title}</h3><p style={{whiteSpace:'pre-wrap'}}>{item.body}</p><footer><span>{manage?`${item.status||'Published'} · ${item.audience||'Everyone'}`:'UHS Phurhuriya'}</span>{manage&&<button onClick={()=>setDraft({...item,audience:item.audience||'Everyone',status:item.status||'Published'})}>Edit</button>}</footer></article>)}</div>
    {!rows.length&&<div className="empty-state">No notices in this view.</div>}
    {draft&&<Modal title={draft.id?'Edit notice':'Create notice'} onClose={()=>setDraft(null)} footer={<><button className="btn btn-secondary" onClick={()=>setDraft(null)}>Cancel</button><button className="btn btn-secondary" onClick={event=>save(event,'Draft')}>Save draft</button><button className="btn btn-primary" type="submit" form="notice-editor">Publish notice</button></>}><form id="notice-editor" className="modal-form" onSubmit={event=>save(event,'Published')}><label>Notice title<input required maxLength={180} value={draft.title} onChange={event=>field('title',event.target.value)}/></label><div className="form-row"><label>Category<select value={draft.tag} onChange={event=>field('tag',event.target.value)}>{['General','Examination','Registration'].map(value=><option key={value}>{value}</option>)}</select></label><label>Audience<select value={draft.audience} onChange={event=>field('audience',event.target.value)}><option value="Everyone">Public website + all portals</option><option value="Students">Students only</option><option value="Staff">Staff only</option></select></label></div><label>Message<textarea required rows={6} value={draft.body} onChange={event=>field('body',event.target.value)}/></label></form></Modal>}
  </>;
}

export function QueryWorkspace({role, data, update, notify, PageTitle, Modal}) {
  const manage = ['admin','headmaster'].includes(role);
  const student = data.students.find(item=>item.id==='UHS-260207');
  const [draft, setDraft] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState('In review');
  const rows = queriesForUser(data.queries, role, student);
  const selected = rows.find(item=>item.id===selectedId);
  const submit = event => {
    event.preventDefault();
    if (role!=='student'||!student||!draft?.subject.trim()||!draft?.message.trim()) return;
    const item={id:`Q-${crypto.randomUUID()}`,studentId:student.id,from:`${student.name} · ${student.className}`,subject:draft.subject.trim(),message:draft.message.trim(),date:schoolDate(),status:'New',replies:[]};
    update('queries', items=>[item,...items], {action:'INSERT',record:item.id,detail:'Student query submitted'});
    setDraft(null); notify('Your query has been submitted.');
  };
  const respond = event => {
    event.preventDefault();
    if(!manage||!selected||!reply.trim())return;
    update('queries', items=>items.map(item=>item.id===selected.id?{...item,status,replies:[...(item.replies||[]),{id:crypto.randomUUID(),body:reply.trim(),role,date:schoolDate()}]}:item),{action:'UPDATE',record:selected.id,detail:`Query response saved; ${status}`});
    setReply('');notify('Reply and status saved.');
  };
  return <><PageTitle title={manage?'Student & parent queries':'My queries'} body={manage?'Read messages, reply and track their status.':'Send a question and read the school’s reply.'} actions={role==='student'&&student&&<button className="btn btn-primary" onClick={()=>setDraft({subject:'',message:''})}>+ Ask a query</button>}/>
    <div className="table-card"><table><thead><tr><th>From</th><th>Subject</th><th>Submitted</th><th>Status</th><th></th></tr></thead><tbody>{rows.map(item=><tr key={item.id}><td>{item.from}</td><td><strong>{item.subject}</strong></td><td>{item.date}</td><td>{item.status}</td><td><button className="table-action" onClick={()=>{setSelectedId(item.id);setReply('');setStatus(item.status==='New'?'In review':item.status);}}>View{manage?' / Reply':''}</button></td></tr>)}</tbody></table>{!rows.length&&<div className="empty-state">No queries yet.</div>}</div>
    {draft&&<Modal title="Ask the school" onClose={()=>setDraft(null)} footer={<><button className="btn btn-secondary" onClick={()=>setDraft(null)}>Cancel</button><button className="btn btn-primary" type="submit" form="query-editor">Submit query</button></>}><form id="query-editor" className="modal-form" onSubmit={submit}><label>Subject<input required maxLength={180} value={draft.subject} onChange={event=>setDraft({...draft,subject:event.target.value})}/></label><label>Message<textarea required rows={6} value={draft.message} onChange={event=>setDraft({...draft,message:event.target.value})}/></label></form></Modal>}
    {selected&&<Modal title={selected.subject} onClose={()=>setSelectedId(null)} footer={<><button className="btn btn-secondary" onClick={()=>setSelectedId(null)}>Close</button>{manage&&<button className="btn btn-primary" type="submit" form="query-response">Save reply & status</button>}</>}><p>{selected.from} · {selected.date}</p>{manage&&selected.mobile&&<p>Contact: {selected.mobile}</p>}<p style={{whiteSpace:'pre-wrap'}}>{selected.message||'The original sample query has no message text.'}</p>{(selected.replies||[]).map(item=><div className="document-box" key={item.id}><div><strong>{item.role} · {item.date}</strong><p style={{whiteSpace:'pre-wrap'}}>{item.body}</p></div></div>)}{manage&&<form id="query-response" className="modal-form" onSubmit={respond}><label>Reply<textarea required rows={4} value={reply} onChange={event=>setReply(event.target.value)}/></label><label>Status<select value={status} onChange={event=>setStatus(event.target.value)}><option>In review</option><option>Resolved</option></select></label></form>}</Modal>}
  </>;
}
