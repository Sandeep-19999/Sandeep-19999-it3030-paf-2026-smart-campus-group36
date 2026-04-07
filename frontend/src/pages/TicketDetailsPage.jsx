import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { ticketService } from '../services/ticketService';
import { formatDate } from '../utils/helpers';
import StatusBadge from '../components/StatusBadge';

export default function TicketDetailsPage() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [comment, setComment] = useState('');
  const [statusForm, setStatusForm] = useState({ status: 'IN_PROGRESS', resolutionNotes: '', rejectionReason: '' });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [message, setMessage] = useState('');

  async function load() {
    const data = await ticketService.getTicketById(id, token);
    setTicket(data);
    if (user?.role === 'ADMIN') {
      const techs = await authService.getTechnicians(token);
      setTechnicians(techs);
    }
  }

  useEffect(() => {
    if (token && user) load().catch(console.error);
  }, [id, token, user]);

  if (!ticket) {
    return <div className="page-center">Loading ticket details...</div>;
  }

  const canManage = user?.role === 'ADMIN' || user?.role === 'TECHNICIAN';
  const canUpload = user?.role === 'ADMIN' || user?.id === ticket.creator?.id;

  const handleAddComment = async (event) => {
    event.preventDefault();
    await ticketService.addComment(ticket.id, comment, token);
    setComment('');
    setMessage('Comment added successfully.');
    await load();
  };

  const handleStatusUpdate = async (event) => {
    event.preventDefault();
    await ticketService.updateStatus(ticket.id, statusForm, token);
    setMessage('Ticket status updated successfully.');
    await load();
  };

  const handleAssign = async (technicianId) => {
    await ticketService.assignTechnician(ticket.id, Number(technicianId), token);
    setMessage('Technician assigned successfully.');
    await load();
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!selectedFiles.length) return;
    await ticketService.addAttachments(ticket.id, selectedFiles, token);
    setSelectedFiles([]);
    setMessage('Attachments uploaded successfully.');
    await load();
  };

  const handleCommentEdit = async (commentItem) => {
    const updated = window.prompt('Edit comment', commentItem.content);
    if (!updated) return;
    await ticketService.updateComment(commentItem.id, updated, token);
    await load();
  };

  const handleCommentDelete = async (commentId) => {
    await ticketService.deleteComment(commentId, token);
    await load();
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
          <form className="form-grid" onSubmit={handleStatusUpdate}>
            <label>Status
              <select value={statusForm.status} onChange={(e) => setStatusForm((prev) => ({ ...prev, status: e.target.value }))}>
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </label>
            <label>Resolution Notes<textarea rows="3" value={statusForm.resolutionNotes} onChange={(e) => setStatusForm((prev) => ({ ...prev, resolutionNotes: e.target.value }))} /></label>
            <label>Rejection Reason<textarea rows="3" value={statusForm.rejectionReason} onChange={(e) => setStatusForm((prev) => ({ ...prev, rejectionReason: e.target.value }))} /></label>
            <button className="primary-btn">Save Status</button>
          </form>
        </section>
      ) : null}

      {canUpload ? (
        <section className="panel">
          <div className="panel-header"><h3>Attachments</h3></div>
          <form className="form-grid" onSubmit={handleUpload}>
            <input type="file" multiple onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))} />
            <button className="secondary-btn">Upload Files</button>
          </form>
          <div className="list-stack">
            {ticket.attachments.map((attachment) => (
              <button key={attachment.id} className="file-link" onClick={() => ticketService.downloadAttachment(attachment.id, token, attachment.originalFileName)}>
                {attachment.originalFileName}
              </button>
            ))}
            {!ticket.attachments.length ? <p className="muted-text">No attachments yet.</p> : null}
          </div>
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
