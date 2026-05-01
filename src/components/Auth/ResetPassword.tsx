import React, { useState } from 'react';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setMessage('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    
    try {
      // Aqui você implementaria a lógica de reset de senha
      setMessage('Senha redefinida com sucesso!');
    } catch (error) {
      setMessage('Erro ao redefinir senha. Tente novamente.');
    }
    
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Redefinir Senha</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <input
            type="password"
            placeholder="Nova senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            required
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <input
            type="password"
            placeholder="Confirmar nova senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input"
            required
          />
        </div>

        {message && (
          <div style={{ color: message.includes('sucesso') ? 'green' : 'red', marginBottom: '20px', textAlign: 'center' }}>
            {message}
          </div>
        )}

        <button
          type="submit"
          className="btn"
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? 'Redefinindo...' : 'Redefinir Senha'}
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

export default ResetPassword;
