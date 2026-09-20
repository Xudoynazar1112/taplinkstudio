import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { formatPrice } from '../utils/helpers';

export default function CRMView({ activePage }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'kanban'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeadModal, setSelectedLeadModal] = useState(null);

  useEffect(() => {
    loadLeads();
  }, [activePage?.slug]);

  async function loadLeads() {
    setLoading(true);
    try {
      const data = await api.crm.getLeads(activePage?.slug);
      setLeads(data || []);
    } catch (err) {
      console.error('Failed to load leads', err);
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await api.crm.updateLeadStatus(leadId, newStatus);
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      if (selectedLeadModal?.id === leadId) {
        setSelectedLeadModal(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert('Statusni yangilashda xatolik: ' + err.message);
    }
  };

  const handleExportCSV = () => {
    window.open(`http://localhost:8000/api/leads/export.csv${activePage?.slug ? `?slug=${activePage.slug}` : ''}`, '_blank');
  };

  // Helper to extract phone or contact
  const getCustomerPhone = (fields) => {
    if (!fields) return null;
    return fields.phone || fields.tel || fields.telefon || fields['Telefon raqamingiz'] || fields.contact || '';
  };

  const getCustomerName = (fields) => {
    if (!fields) return 'Mijoz';
    return fields.name || fields.ism || fields.fullname || fields['Ismingiz'] || 'Nomsiz Mijoz';
  };

  // Filter leads
  const filteredLeads = leads.filter(l => {
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = getCustomerName(l.fields).toLowerCase();
      const phone = getCustomerPhone(l.fields).toLowerCase();
      const id = (l.id || '').toLowerCase();
      return name.includes(q) || phone.includes(q) || id.includes(q);
    }
    return true;
  });

  const totalRevenue = leads.reduce((sum, l) => sum + (l.amount || 0), 0);
  const totalNew = leads.filter(l => l.status === 'new').length;
  const totalContacted = leads.filter(l => l.status === 'contacted').length;
  const totalPaid = leads.filter(l => l.status === 'paid').length;
  const totalCancelled = leads.filter(l => l.status === 'cancelled').length;

  const kanbanColumns = [
    { id: 'new', label: '🆕 Yangi Arizalar', count: totalNew, color: '#3b82f6' },
    { id: 'contacted', label: '📞 Bog\'lanildi', count: totalContacted, color: '#f59e0b' },
    { id: 'paid', label: '✅ To\'landi & Yakunlandi', count: totalPaid, color: '#10b981' },
    { id: 'cancelled', label: '❌ Bekor Qilindi', count: totalCancelled, color: '#ef4444' },
  ];

  return (
    <div className="crm-view-container">
      <div className="view-page-header">
        <div className="header-title-actions">
          <div>
            <h2>CRM & Lidlar Boshqaruvi</h2>
            <p>Sahifangiz orqali kelib tushgan buyurtmalar, arizalar va mijozlar bazasi</p>
          </div>

          <div className="crm-header-actions">
            {/* View Mode Switcher */}
            <div className="crm-view-mode-switcher">
              <button
                type="button"
                className={`crm-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
              >
                📋 Jadval
              </button>
              <button
                type="button"
                className={`crm-mode-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                onClick={() => setViewMode('kanban')}
              >
                📊 Kanban Doskasi
              </button>
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={handleExportCSV}
            >
              📥 CSV Yuklab olish
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={loadLeads}
            >
              🔄 Yangilash
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="crm-kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Jami Lidlar / Arizalar</span>
          <span className="kpi-value">{leads.length}</span>
          <span className="kpi-subtext">Barcha qabullar</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Yangi Lidlar</span>
          <span className="kpi-value highlight-blue">{totalNew}</span>
          <span className="kpi-subtext">Ko'rib chiqilishi kerak</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">To'langan Buyurtmalar</span>
          <span className="kpi-value highlight-green">{totalPaid}</span>
          <span className="kpi-subtext">Muvaffaqiyatli xarid</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Jami Daromad</span>
          <span className="kpi-value highlight-gold">{formatPrice(totalRevenue)}</span>
          <span className="kpi-subtext">Tushum summasi</span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="crm-filter-search-row mt-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div className="category-filter-chips">
          {[
            { id: 'all', label: `Barchasi (${leads.length})` },
            { id: 'new', label: `Yangi (${totalNew})` },
            { id: 'contacted', label: `Bog'lanildi (${totalContacted})` },
            { id: 'paid', label: `To'landi (${totalPaid})` },
            { id: 'cancelled', label: `Bekor qilindi (${totalCancelled})` },
          ].map(f => (
            <button
              key={f.id}
              type="button"
              className={`filter-chip-btn ${statusFilter === f.id ? 'active' : ''}`}
              onClick={() => setStatusFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="crm-search-box" style={{ minWidth: '240px' }}>
          <input
            type="text"
            placeholder="Ism yoki telefon bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ padding: '7px 12px', fontSize: '13px' }}
          />
        </div>
      </div>

      {/* Leads Content: Table View vs Kanban Board */}
      {loading ? (
        <div className="loading-state">Lidlar yuklanmoqda...</div>
      ) : filteredLeads.length === 0 ? (
        <div className="empty-blocks-state mt-4">
          <span className="empty-icon">📭</span>
          <h4>Hozircha hech qanday lid yoki buyurtma mavjud emas</h4>
          <p>Mijozlar bio sahifangizdagi ariza formasi yoki mini-do'kon orqali murojaat qilganda barcha ma'lumotlar real vaqtda shu yerda paydo bo'ladi.</p>
        </div>
      ) : viewMode === 'kanban' ? (
        /* KANBAN BOARD VIEW */
        <div className="crm-kanban-board">
          {kanbanColumns.map(col => {
            const colLeads = filteredLeads.filter(l => (l.status || 'new') === col.id);
            return (
              <div key={col.id} className="kanban-column">
                <div className="kanban-column-header">
                  <span className="kanban-column-title">{col.label}</span>
                  <span className="kanban-column-count">{colLeads.length}</span>
                </div>

                <div className="kanban-cards-stack">
                  {colLeads.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '12px' }}>
                      Ushbu statusda lidlar yo'q
                    </div>
                  ) : (
                    colLeads.map(lead => {
                      const phone = getCustomerPhone(lead.fields);
                      const name = getCustomerName(lead.fields);
                      const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';

                      return (
                        <div
                          key={lead.id}
                          className="kanban-lead-card"
                          onClick={() => setSelectedLeadModal(lead)}
                        >
                          <div className="kanban-card-top">
                            <span className="kanban-card-id">#{lead.id.substring(0, 8)}</span>
                            {lead.amount ? (
                              <span className="kanban-card-amount">{formatPrice(lead.amount)}</span>
                            ) : null}
                          </div>

                          <div className="kanban-card-customer">{name}</div>
                          {phone && <div className="kanban-card-phone">📞 {phone}</div>}

                          <div className="kanban-card-actions" onClick={(e) => e.stopPropagation()}>
                            {phone && (
                              <>
                                <a
                                  href={`tel:${phone}`}
                                  className="action-chip-link"
                                  title="Telefon qilish"
                                >
                                  📞 Qo'ng'iroq
                                </a>
                                <a
                                  href={`https://t.me/+${cleanPhone}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="action-chip-link telegram"
                                  title="Telegram orqali yozish"
                                >
                                  ✈️ Telegram
                                </a>
                              </>
                            )}

                            <select
                              value={lead.status || 'new'}
                              onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                              className={`lead-status-select status-${lead.status || 'new'}`}
                              style={{ marginLeft: 'auto', padding: '2px 6px', fontSize: '11px' }}
                            >
                              <option value="new">Yangi</option>
                              <option value="contacted">Bog'lanildi</option>
                              <option value="paid">To'landi</option>
                              <option value="cancelled">Bekor</option>
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* DATA TABLE VIEW */
        <div className="crm-table-wrapper mt-3">
          <table className="crm-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Mijoz Ma'lumotlari</th>
                <th>Tezkor Bog'lanish</th>
                <th>Sahifa</th>
                <th>Summa</th>
                <th>Status</th>
                <th>Sana</th>
                <th>Batafsil</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => {
                const phone = getCustomerPhone(lead.fields);
                const name = getCustomerName(lead.fields);
                const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';

                return (
                  <tr key={lead.id}>
                    <td>
                      <span className="lead-id-code">#{lead.id.substring(0, 8)}</span>
                    </td>
                    <td>
                      <div>
                        <strong>{name}</strong>
                        {phone && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{phone}</div>}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {phone && (
                          <>
                            <a
                              href={`tel:${phone}`}
                              className="action-chip-link"
                              title="Telefon qilish"
                            >
                              📞
                            </a>
                            <a
                              href={`https://t.me/+${cleanPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="action-chip-link telegram"
                              title="Telegram orqali yozish"
                            >
                              ✈️
                            </a>
                          </>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="lead-page-tag">/{lead.page_slug}</span>
                    </td>
                    <td>
                      <strong>{formatPrice(lead.amount || 0)}</strong>
                    </td>
                    <td>
                      <select
                        value={lead.status || 'new'}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className={`lead-status-select status-${lead.status || 'new'}`}
                      >
                        <option value="new">🆕 Yangi</option>
                        <option value="contacted">📞 Bog'lanildi</option>
                        <option value="paid">✅ To'landi</option>
                        <option value="cancelled">❌ Bekor qilindi</option>
                      </select>
                    </td>
                    <td>
                      <span className="lead-date-text">
                        {new Date(lead.created_at || Date.now()).toLocaleDateString('uz-UZ')}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-secondary-sm"
                        onClick={() => setSelectedLeadModal(lead)}
                      >
                        👁️ Ko'rish
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedLeadModal && (
        <div className="modal-backdrop" onClick={() => setSelectedLeadModal(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <button className="modal-close-btn" onClick={() => setSelectedLeadModal(null)}>✕</button>

            <div className="modal-header">
              <h3>Lid Tafsilotlari #{selectedLeadModal.id.substring(0, 8)}</h3>
              <p>Sahifa: /{selectedLeadModal.page_slug} • Sana: {new Date(selectedLeadModal.created_at || Date.now()).toLocaleString('uz-UZ')}</p>
            </div>

            <div style={{ margin: '16px 0' }}>
              <div className="form-group mb-3">
                <label style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-muted)' }}>Lid Statusini O'zgartirish</label>
                <select
                  value={selectedLeadModal.status || 'new'}
                  onChange={(e) => handleStatusChange(selectedLeadModal.id, e.target.value)}
                  className={`lead-status-select status-${selectedLeadModal.status || 'new'}`}
                  style={{ width: '100%', padding: '10px' }}
                >
                  <option value="new">🆕 Yangi</option>
                  <option value="contacted">📞 Bog'lanildi</option>
                  <option value="paid">✅ To'landi</option>
                  <option value="cancelled">❌ Bekor qilindi</option>
                </select>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Mijoz Yuborgan Maydonlar</h4>
                {selectedLeadModal.fields && Object.entries(selectedLeadModal.fields).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{k}:</span>
                    <strong style={{ fontSize: '13px' }}>{String(v)}</strong>
                  </div>
                ))}

                {selectedLeadModal.amount ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', marginTop: '6px' }}>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>To'lov summasi:</span>
                    <strong style={{ color: '#10b981', fontSize: '15px' }}>{formatPrice(selectedLeadModal.amount)}</strong>
                  </div>
                ) : null}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSelectedLeadModal(null)}
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

