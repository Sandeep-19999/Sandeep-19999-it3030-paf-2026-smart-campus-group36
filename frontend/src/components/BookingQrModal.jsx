export default function BookingQrModal({ open, loading, bookingId, qrCodeToken, qrCodeImageBase64, onClose }) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="panel-header">
          <h3>Booking #{bookingId} QR</h3>
          <button className="text-btn" type="button" onClick={onClose}>Close</button>
        </div>
        {loading ? <p className="muted-text">Loading QR...</p> : null}
        {!loading && qrCodeImageBase64 ? (
          <div className="qr-modal-content">
            <img
              className="booking-qr-image"
              src={`data:image/png;base64,${qrCodeImageBase64}`}
              alt={`Booking ${bookingId} QR Code`}
            />
            <p className="muted-text qr-token-text">{qrCodeToken}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
