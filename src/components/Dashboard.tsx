import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>CRM PMG Academy</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span>Bem-vindo, {user?.email}</span>
          <button onClick={handleLogout} className="btn">
            Sair
          </button>
        </div>
      </header>

      <main>
        <section style={{ marginBottom: '30px' }}>
          <h2>Dashboard</h2>
          <p>Bem-vindo ao seu painel de controle CRM PMG!</p>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3>Clientes</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>0</p>
          </div>
          
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3>Vendas</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>0</p>
          </div>
          
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3>Leads</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>0</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
