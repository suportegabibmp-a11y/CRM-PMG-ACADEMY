import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      // Aqui você implementaria o envio de email de recuperação
      setMessage('Email de recuperação enviado! Verifique sua caixa de entrada.');
    } catch (error) {
      setMessage('Erro ao enviar email. Tente novamente.');
    }
    
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Recuperar Senha</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            required
          />
        </div>

        {message && (
          <div style={{ color: 'green', marginBottom: '20px', textAlign: 'center' }}>
            {message}
          </div>
        )}

        <button
          type="submit"
          className="btn"
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? 'Enviando...' : 'Enviar Email de Recuperação'}
        </button>
      </form>
      
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <a href="/login" style={{ color: '#2563eb', textDecoration: 'none' }}>
          Voltar para o login
        </a>
      </div>
    </div>
  );
};

export default ForgotPassword;
