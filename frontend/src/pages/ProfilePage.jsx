import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatRoleLabel, resolveAvatarUrl } from '../utils/helpers';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export default function ProfilePage() {
  const { user, updateAvatar } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const currentAvatarUrl = useMemo(() => resolveAvatarUrl(user?.avatarUrl), [user?.avatarUrl]);
  const displayAvatar = previewUrl || currentAvatarUrl;

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setError('');
    setSuccessMessage('');

    if (!file) {
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl('');
      }
      return;
    }

    if (!file.type.toLowerCase().startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setError('Image must be 5MB or smaller');
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!selectedFile) {
      setError('Please choose a profile picture first');
      return;
    }

    try {
      setSubmitting(true);
      await updateAvatar(selectedFile);
      setSuccessMessage('Profile picture updated successfully');
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl('');
    } catch (uploadError) {
      setError(uploadError?.message || 'Failed to update profile picture');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="content-grid">
      <section className="panel profile-panel">
        <div className="panel-header">
          <h3>Profile</h3>
        </div>
        <p className="muted-text">Update your profile picture. This is available for students, admins, and lecturers.</p>

        <div className="profile-summary">
          <div className="profile-avatar-preview" aria-hidden="true">
            {displayAvatar ? <img src={displayAvatar} alt="Profile" className="profile-avatar-image" /> : (user?.fullName || 'U').slice(0, 1).toUpperCase()}
          </div>
          <div className="profile-summary-meta">
            <strong>{user?.fullName || 'User'}</strong>
            <span>{user?.email}</span>
            <span>{formatRoleLabel(user?.role)}</span>
          </div>
        </div>

        <form className="form-grid profile-upload-form" onSubmit={handleUpload}>
          <label>
            Choose Profile Picture
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </label>

          {error ? <div className="error-box">{error}</div> : null}
          {successMessage ? <div className="success-box">{successMessage}</div> : null}

          <button type="submit" className="primary-btn" disabled={submitting}>
            {submitting ? 'Uploading...' : 'Upload Profile Picture'}
          </button>
        </form>
      </section>
    </div>
  );
}
