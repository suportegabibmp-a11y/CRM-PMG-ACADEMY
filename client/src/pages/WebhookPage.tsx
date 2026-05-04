import React, { useState } from 'react';
import { webhookService } from '../services/webhookService';

export const WebhookPage: React.FC = () => {
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [testPayload, setTestPayload] = useState<string>('');
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Gerar URL do webhook
  React.useEffect(() => {
    const baseUrl = window.location.origin;
    const webhookUrl = `${baseUrl}/api/webhook/cakto`;
    setWebhookUrl(webhookUrl);
  }, []);

  // Testar webhook
  const testWebhook = async () => {
    setIsLoading(true);
    setTestResult('');

    try {
      const payload = {
        event: 'payment.completed',
        payment: {
          id: 'test_payment_123',
          amount: '99.90',
          customer: {
            name: 'Cliente Teste',
            email: 'cliente@teste.com'
          },
          description: 'Pagamento teste - Plano Mensal',
          external_id: 'invoice_test_123'
        }
      };

      // Simular chamada webhook
      const result = await webhookService.processCaktoWebhook(payload);
      
      setTestResult(`✅ Teste realizado com sucesso!\n\nResultado: ${result.message}\n\nPayload enviado:\n${JSON.stringify(payload, null, 2)}`);
    } catch (error) {
      setTestResult(`❌ Erro no teste: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Copiar URL para clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl);
    alert('URL do webhook copiada para a área de transferência!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Integração com Cakto</h1>
          
          {/* URL do Webhook */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">URL do Webhook</h2>
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <code className="text-sm text-gray-700 break-all">{webhookUrl}</code>
                <button
                  onClick={copyToClipboard}
                  className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Copiar
                </button>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Use esta URL na plataforma Cakto para receber notificações de pagamento.
            </p>
          </div>

          {/* Eventos Suportados */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Eventos Suportados</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800">payment.completed</h3>
                <p className="text-sm text-green-600 mt-1">Pagamento concluído com sucesso</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="font-semibold text-yellow-800">payment.pending</h3>
                <p className="text-sm text-yellow-600 mt-1">Pagamento aguardando confirmação</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h3 className="font-semibold text-red-800">payment.failed</h3>
                <p className="text-sm text-red-600 mt-1">Pagamento falhou</p>
              </div>
            </div>
          </div>

          {/* Formato do Payload */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Formato do Payload Esperado</h2>
            <div className="bg-gray-900 text-gray-300 p-4 rounded-lg overflow-x-auto">
              <pre>{`{
  "event": "payment.completed",
  "payment": {
    "id": "payment_id_123",
    "amount": "99.90",
    "customer": {
      "name": "Nome do Cliente",
      "email": "cliente@exemplo.com"
    },
    "description": "Descrição do pagamento",
    "external_id": "invoice_id_123"
  }
}`}</pre>
            </div>
          </div>

          {/* Teste do Webhook */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Testar Webhook</h2>
            <div className="space-y-4">
              <button
                onClick={testWebhook}
                disabled={isLoading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Testando...' : 'Testar Webhook Local'}
              </button>
              
              {testResult && (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">{testResult}</pre>
                </div>
              )}
            </div>
          </div>

          {/* Instruções de Configuração */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Como Configurar no Cakto</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Acesse sua conta Cakto</li>
              <li>Vá para Configurações &gt; Webhooks</li>
              <li>Adicione a URL do webhook: <code className="bg-gray-100 px-2 py-1 rounded">{webhookUrl}</code></li>
              <li>Selecione os eventos que deseja receber</li>
              <li>Configure o secret (opcional) para segurança adicional</li>
              <li>Salve as configurações</li>
            </ol>
          </div>

          {/* Funcionalidades Automáticas */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Funcionalidades Automáticas</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>✅ Atualização automática do status das faturas</li>
              <li>✅ Criação automática de clientes novos</li>
              <li>✅ Sincronização com o dashboard CRM</li>
              <li>✅ Persistência de dados no localStorage</li>
              <li>✅ Notificações de eventos de pagamento</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
