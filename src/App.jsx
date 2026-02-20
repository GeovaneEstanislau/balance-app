import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, LayoutGrid, Settings, TrendingUp, TrendingDown } from 'lucide-react';
import { fetchSheetsData, calculateBalance } from './utils/sheets';

const DEFAULT_SHEET_ID = ''; // User can paste their ID here

function App() {
  const [sheetId, setSheetId] = useState(localStorage.getItem('sheetId') || '');
  const [data, setData] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    if (!sheetId) return;
    setLoading(true);
    setError(null);
    try {
      const sheetsData = await fetchSheetsData(sheetId);
      setData(sheetsData);
      setBalance(calculateBalance(sheetsData));
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar dados. Verifique o ID e se a planilha está "Publicada na Web".');
    } finally {
      setLoading(false);
    }
  }, [sheetId]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, [loadData]);

  useEffect(() => {
    localStorage.setItem('sheetId', sheetId);
  }, [sheetId]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Balanço Real</h1>
        <button
          onClick={loadData}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          className={loading ? 'loading' : ''}
        >
          <RefreshCw size={20} />
        </button>
      </header>

      <div className="balance-card">
        <div className="balance-label">Saldo Atual</div>
        <div className={`balance-amount ${balance < 0 ? 'negative' : ''}`}>
          {loading && !balance ? '...' : formatCurrency(balance)}
        </div>
        <div className="refresh-status">
          <div className="status-dot"></div>
          {lastUpdated
            ? `Atualizado às ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : 'Aguardando dados...'}
        </div>
      </div>

      <div className="transactions-list">
        <h2>Últimas Movimentações</h2>
        {data.slice(-5).reverse().map((item, idx) => (
          <div key={idx} className="transaction-item">
            <div className="tx-info">
              <span className="tx-desc">{item['Descrição'] || 'Sem descrição'}</span>
              <span className="tx-date">{item['Data'] || '--/--/--'}</span>
            </div>
            <div className={`tx-amount ${item['Valor'] >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(item['Valor'] || 0)}
            </div>
          </div>
        ))}
        {data.length === 0 && !loading && (
          <div style={{ color: var('--text-muted'), textAlign: 'center', padding: '20px' }}>
            Nenhum dado encontrado
          </div>
        )}
      </div>

      <div className="settings-card">
        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <Settings size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
          Google Sheet ID
        </label>
        <input
          type="text"
          value={sheetId}
          onChange={(e) => setSheetId(e.target.value)}
          placeholder="Cole o ID da planilha publicada..."
        />
        {error && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '8px' }}>{error}</p>}
      </div>
    </div>
  );
}

export default App;
