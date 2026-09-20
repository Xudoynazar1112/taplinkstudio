import React, { useState } from 'react';
import { api } from '../../utils/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let data;
      if (isRegister) {
        data = await api.auth.register({ email, password, name });
      } else {
        data = await api.auth.login({ email, password });
      }

      if (data.token) {
        localStorage.setItem('linkstudio_token', data.token);
        onAuthSuccess(data.user);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>

        <div className="auth-header">
          <div className="auth-logo">⚡ LinkStudio Pro</div>
          <h3>{isRegister ? 'Yangi hisob ochish' : 'Tizimga kirish'}</h3>
          <p>{isRegister ? 'Barcha imkoniyatlardan to\'liq foydalanish uchun ro\'yxatdan o\'ting' : 'Bio sahifalaringizni boshqarish uchun kiring'}</p>
        </div>

        {error && <div className="auth-error-badge">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <div className="form-group">
              <label>Ismingiz</label>
              <input
                type="text"
                required
                placeholder="Masalan: Sardor Rahimov"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
              />
            </div>
          )}

          <div className="form-group">
            <label>Email manzilingiz</label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Parol</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary auth-submit-btn">
            {loading ? 'Bajarilmoqda...' : (isRegister ? 'Ro\'yxatdan o\'tish' : 'Kirish')}
          </button>
        </form>

        <div className="auth-toggle-footer">
          {isRegister ? (
            <p>
              Hisobingiz bormi?{' '}
              <button type="button" onClick={() => { setIsRegister(false); setError(''); }} className="auth-toggle-link">
                Kirish
              </button>
            </p>
          ) : (
            <p>
              Hisobingiz yo'qmi?{' '}
              <button type="button" onClick={() => { setIsRegister(true); setError(''); }} className="auth-toggle-link">
                Ro'yxatdan o'ting
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
