import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { ticketService } from '../services/ticketService';
import { formatDate, getAllowedTicketTransitions } from '../utils/helpers';
import StatusBadge from '../components/StatusBadge';

function getAttachmentBadgeClass(status) {
  if (status === 'APPROVED') return 'badge badge-approved';
  if (status === 'REJECTED') return 'badge badge-rejected';
  return 'badge badge-pending';
}

export default function TicketDetailsPage() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [comment, setComment] = useState('');
  const [statusForm, setStatusForm] = useState({ status: 'IN_PROGRESS', resolutionNotes: '', rejectionReason: '' });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewName, setPreviewName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const data = await ticketService.getTicketById(id, token);
    setTicket(data);
    const allowedTransitions = getAllowedTicketTransitions(data.status, user?.role);
    setStatusForm((prev) => ({
      ...prev,
      status: allowedTransitions[0] || data.status,
      resolutionNotes: '',
      rejectionReason: ''
    }));
    if (user?.role === 'ADMIN') {
      const techs = await authService.getTechnicians(token);
      setTechnicians(techs);
    }
  }

  useEffect(() => {
    if (token && user) load().catch((err) => setError(err.message));
  }, [id, token, user]);

  const allowedTransitions = useMemo(
    () => getAllowedTicketTransitions(ticket?.status, user?.role),
    [ticket?.status, user?.role]
  );

  if (!ticket) {
    return <div className="page-center">Loading ticket details...</div>;
  }

  const isAssignedTechnician = user?.role === 'TECHNICIAN' && user?.id === ticket.assignedTechnician?.id;
  const canManage = user?.role === 'ADMIN' || isAssignedTechnician;
  const canUpload = user?.id === ticket.creator?.id && ticket.attachments.length < 3 && !['CLOSED', 'REJECTED'].includes(ticket.status);

  const handleAddComment = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      await ticketService.addComment(ticket.id, comment, token);
      setComment('');
      setMessage('Comment added successfully.');
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusUpdate = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      await ticketService.updateStatus(ticket.id, statusForm, token);
      setMessage('Ticket status updated successfully.');
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAssign = async (technicianId) => {
    setError('');
    setMessage('');
    try {
      await ticketService.assignTechnician(ticket.id, Number(technicianId), token);
      setMessage('Technician assigned successfully.');
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (!selectedFiles.length) return;
    if (ticket.attachments.length + selectedFiles.length > 3) {
      setError('A ticket can only contain up to 3 attachments.');
      return;
    }
    const invalidFile = selectedFiles.find((file) => !file.type.startsWith('image/'));
    if (invalidFile) {
      setError('Only image attachments are allowed.');
      return;
    }
    try {
      await ticketService.addAttachments(ticket.id, selectedFiles, token);
      setSelectedFiles([]);
      setMessage('Attachments uploaded successfully.');
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCommentEdit = async (commentItem) => {
    const updated = window.prompt('Edit comment', commentItem.content);
    if (!updated) return;
    setError('');
    try {
      await ticketService.updateComment(commentItem.id, updated, token);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCommentDelete = async (commentId) => {
    setError('');
    try {
      await ticketService.deleteComment(commentId, token);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAttachmentReview = async (attachment, status) => {
    const adminMessage = window.prompt(`Enter message for the user (${status.toLowerCase()})`) || '';
    if (!adminMessage.trim()) {
      setError('Message is required when approving or rejecting a photo.');
      return;
    }
    setError('');
    setMessage('');
    try {
      await ticketService.reviewAttachment(ticket.id, attachment.id, { status, adminMessage: adminMessage.trim() }, token);
      setMessage('Photo review saved and user notified.');
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAttachmentPreview = async (attachment) => {
    setError('');
    try {
      const blob = await ticketService.getAttachmentBlob(attachment.id, token);
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
      const nextUrl = window.URL.createObjectURL(blob);
      setPreviewUrl(nextUrl);
      setPreviewName(attachment.originalFileName);
    } catch (err) {
      setError(err.message);
    }
  };

  const closePreview = () => {
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
    setPreviewName('');
  };

  return (
    <div className="content-grid">
      <section className="panel">
        <div className="panel-header">
          <h3>Ticket #{ticket.id} - {ticket.title}</h3>
          <StatusBadge value={ticket.status} />
        </div>
        <div className="detail-grid">
          <div><strong>Category:</strong> {ticket.category}</div>
          <div><strong>Priority:</strong> {ticket.priority}</div>
          <div><strong>Location:</strong> {ticket.locationLabel}</div>
          <div><strong>Resource:</strong> {ticket.resourceName || 'N/A'}</div>
          <div><strong>Created by:</strong> {ticket.creator?.fullName}</div>
          <div><strong>Assigned Technician:</strong> {ticket.assignedTechnician?.fullName || 'Not assigned yet'}</div>
          <div><strong>Created at:</strong> {formatDate(ticket.createdAt)}</div>
          <div><strong>Updated at:</strong> {formatDate(ticket.updatedAt)}</div>
          <div className="full-span"><strong>Description:</strong> {ticket.description}</div>
          {ticket.rejectionReason ? <div className="full-span"><strong>Rejection Reason:</strong> {ticket.rejectionReason}</div> : null}
          {ticket.resolutionNotes ? <div className="full-span"><strong>Resolution Notes:</strong> {ticket.resolutionNotes}</div> : null}
        </div>
        {message ? <div className="success-box">{message}</div> : null}
        {error ? <div className="error-box">{error}</div> : null}
      </section>

      {user?.role === 'ADMIN' ? (
        <section className="panel">
          <div className="panel-header"><h3>Assign Technician</h3></div>
          <select onChange={(e) => e.target.value && handleAssign(e.target.value)} defaultValue="">
            <option value="" disabled>Select technician</option>
            {technicians.map((tech) => (
              <option key={tech.id} value={tech.id}>{tech.fullName} - {tech.email}</option>
            ))}
          </select>
        </section>
      ) : null}

      {canManage ? (
        <section className="panel">
          <div className="panel-header"><h3>Update Status</h3></div>
          {allowedTransitions.length ? (
            <form className="form-grid" onSubmit={handleStatusUpdate}>
              <label>Status
                <select value={statusForm.status} onChange={(e) => setStatusForm((prev) => ({ ...prev, status: e.target.value }))}>
                  {allowedTransitions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </label>
              <label>Resolution Notes<textarea rows="3" value={statusForm.resolutionNotes} onChange={(e) => setStatusForm((prev) => ({ ...prev, resolutionNotes: e.target.value }))} /></label>
              {user?.role === 'ADMIN' ? (
                <label>Rejection Reason<textarea rows="3" value={statusForm.rejectionReason} onChange={(e) => setStatusForm((prev) => ({ ...prev, rejectionReason: e.target.value }))} /></label>
              ) : null}
              <button className="primary-btn">Save Status</button>
            </form>
          ) : (
            <p className="muted-text">No further status transitions are available for this ticket.</p>
          )}
        </section>
      ) : null}

      <section className="panel">
        <div className="panel-header"><h3>Attachments</h3></div>
        {canUpload ? (
          <form className="form-grid" onSubmit={handleUpload}>
            <input type="file" accept="image/*" multiple onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))} />
            <p className="muted-text">Only image files are allowed. Maximum 3 attachments per ticket.</p>
            <button className="secondary-btn">Upload Files</button>
          </form>
        ) : (
          <p className="muted-text">Only the ticket creator can upload photos while the ticket is still active.</p>
        )}
        <div className="list-stack">
          {ticket.attachments.map((attachment) => (
            <div key={attachment.id} className="attachment-card">
              <div className="attachment-meta">
                <strong>{attachment.originalFileName}</strong>
                <span className={getAttachmentBadgeClass(attachment.reviewStatus)}>{attachment.reviewStatus}</span>
                {attachment.reviewMessage ? <p className="muted-text">Admin message: {attachment.reviewMessage}</p> : null}
                {attachment.reviewedBy ? <p className="muted-text">Reviewed by {attachment.reviewedBy.fullName} at {formatDate(attachment.reviewedAt)}</p> : null}
              </div>
              <div className="attachment-actions">
                <button className="file-link" onClick={() => handleAttachmentPreview(attachment)}>View</button>
                <button className="file-link" onClick={() => ticketService.downloadAttachment(attachment.id, token, attachment.originalFileName)}>Download</button>
                {user?.role === 'ADMIN' ? (
                  <>
                    <button className="text-btn" onClick={() => handleAttachmentReview(attachment, 'APPROVED')}>Approve</button>
                    <button className="text-btn danger-text" onClick={() => handleAttachmentReview(attachment, 'REJECTED')}>Reject</button>
                  </>
                ) : null}
              </div>
            </div>
          ))}
          {!ticket.attachments.length ? <p className="muted-text">No attachments yet.</p> : null}
        </div>
      </section>

      {previewUrl ? (
        <section className="panel">
          <div className="panel-header">
            <h3>Photo Preview - {previewName}</h3>
            <button className="text-btn" onClick={closePreview}>Close</button>
          </div>
          <img src={previewUrl} alt={previewName} className="attachment-preview" />
        </section>
      ) : null}

      <section className="panel">
        <div className="panel-header"><h3>Comments</h3></div>
        <form className="form-grid" onSubmit={handleAddComment}>
          <textarea rows="3" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a comment..." />
          <button className="primary-btn">Add Comment</button>
        </form>
        <div className="list-stack">
          {ticket.comments.map((item) => (
            <div key={item.id} className="comment-card">
              <div className="comment-header">
                <strong>{item.author?.fullName}</strong>
                <span className="muted-text">{formatDate(item.createdAt)}</span>
              </div>
              <p>{item.content}</p>
              {item.editable ? (
                <div className="comment-actions">
                  <button className="text-btn" onClick={() => handleCommentEdit(item)}>Edit</button>
                  <button className="text-btn danger-text" onClick={() => handleCommentDelete(item.id)}>Delete</button>
                </div>
              ) : null}
            </div>
          ))}
          {!ticket.comments.length ? <p className="muted-text">No comments yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
