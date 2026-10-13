export const canDecideApproval = (approvals, role) => ['admin', 'headmaster'].includes(role) && Boolean(approvals) && !approvals[role];
export const approvalTimestamp = () => new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
