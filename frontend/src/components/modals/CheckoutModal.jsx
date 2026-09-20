import React, { useState } from 'react';
import { api } from '../../utils/api';
import { formatPrice } from '../../utils/helpers';

export default function CheckoutModal({ item, pageSlug, onClose }) {
  const [step, setStep] = useState('details'); // 'details' | 'payment' | 'success'
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [comment, setComment] = useState('');
  const [paymentProvider, setPaymentProvider] = useState('click');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!name || !phone) {
      setError('Ism va telefon raqami majburiy');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await api.crm.createCheckout({
        pageSlug,
        blockId: item.blockId,
        customerName: name,
        customerPhone: phone,
        items: [{ title: item.title, price: item.price, quantity: 1 }],
        totalAmount: item.price,
        paymentProvider,
        notes: comment,
      });

      setOrder(result.order);
      setStep('payment');
    } catch (err) {
      setError(err.message || 'Buyurtma yaratishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!order) return;
    setLoading(true);
    try {
      await api.crm.payOrder(order.id, {
        paymentProvider,
        transactionId: `TXN_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      });
      setStep('success');
    } catch (err) {
      alert('To\'lovda xatolik: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog checkout-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>

        {step === 'details' && (
          <div>
            <div className="modal-header">
              <h3>Buyurtmani Rasmiylashtirish</h3>
              <p>Ma'lumotlaringizni kiriting va xaridni yakunlang</p>
            </div>

            <div className="checkout-summary-card">
              <div className="summary-item-title">{item.title}</div>
              <div className="summary-item-price">{formatPrice(item.price)}</div>
            </div>

            {error && <div className="auth-error-badge">{error}</div>}

            <form onSubmit={handleCreateOrder} className="checkout-form">
              <div className="form-group">
                <label>To'liq Ismingiz *</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Sardor Rahimov"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Telefon raqamingiz *</label>
                <input
                  type="tel"
                  required
                  placeholder="+998 90 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>To'lov usuli</label>
                <div className="payment-providers-grid">
                  <div
                    className={`provider-card ${paymentProvider === 'click' ? 'active' : ''}`}
                    onClick={() => setPaymentProvider('click')}
                  >
                    <span className="provider-icon">🔵</span>
                    <span className="provider-name">Click</span>
                  </div>
                  <div
                    className={`provider-card ${paymentProvider === 'payme' ? 'active' : ''}`}
                    onClick={() => setPaymentProvider('payme')}
                  >
                    <span className="provider-icon">🟢</span>
                    <span className="provider-name">Payme</span>
                  </div>
                  <div
                    className={`provider-card ${paymentProvider === 'uzum' ? 'active' : ''}`}
                    onClick={() => setPaymentProvider('uzum')}
                  >
                    <span className="provider-icon">🟣</span>
                    <span className="provider-name">Uzum Pay</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Qo'shimcha izoh (ixtiyoriy)</label>
                <input
                  type="text"
                  placeholder="Yetkazib berish manzili yoki qulay vaqt..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={onClose} className="btn-secondary">
                  Bekor qilish
                </button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Yaratilmoqda...' : 'Davom etish (To\'lov)'}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'payment' && (
          <div className="payment-step-view">
            <div className="modal-header">
              <h3>To'lovni Tasdiqlash</h3>
              <p>Buyurtma ID: #{order?.id?.substring(0, 8)}</p>
            </div>

            <div className="payment-invoice-box">
              <div className="invoice-row">
                <span>Mahsulot:</span>
                <strong>{item.title}</strong>
              </div>
              <div className="invoice-row">
                <span>To'lov tizimi:</span>
                <strong className="capitalize">{paymentProvider}</strong>
              </div>
              <div className="invoice-row total-row">
                <span>Jami to'lov:</span>
                <strong className="invoice-total">{formatPrice(item.price)}</strong>
              </div>
            </div>

            <div className="payment-simulation-actions">
              <button
                type="button"
                disabled={loading}
                onClick={handleSimulatePayment}
                className="btn-primary pay-now-btn"
              >
                {loading ? 'Tekshirilmoqda...' : `💳 ${paymentProvider.toUpperCase()} orqali to'lash`}
              </button>
              <button type="button" onClick={() => setStep('details')} className="btn-secondary">
                Orqaga
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="checkout-success-view">
            <span className="success-big-icon">🎉</span>
            <h3>To'lov muvaffaqiyatli qabul qilindi!</h3>
            <p>Buyurtmangiz tasdiqlandi. Tez orada buyurtma bo'yicha menejer siz bilan bog'lanadi.</p>
            <button type="button" onClick={onClose} className="btn-primary">
              Tushundim
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
