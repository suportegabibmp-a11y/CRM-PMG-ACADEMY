// Webhook service para integração com Cakto

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive';
  createdAt: string;
  totalSpent: number;
}

interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  description: string;
  paymentMethod?: string;
  transactionId?: string;
  clientEmail?: string;
}
export class WebhookService {
  private static instance: WebhookService;

  static getInstance(): WebhookService {
    if (!WebhookService.instance) {
      WebhookService.instance = new WebhookService();
    }
    return WebhookService.instance;
  }

  // Processar webhook do Cakto
  async processCaktoWebhook(payload: any): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Processando webhook Cakto:', payload);

      const eventType = payload.event || payload.type;

      switch (eventType) {
        case 'payment.completed':
          await this.handlePaymentCompleted(payload);
          break;
        case 'payment.failed':
          await this.handlePaymentFailed(payload);
          break;
        case 'payment.pending':
          await this.handlePaymentPending(payload);
          break;
        default:
          console.log('Evento não tratado:', eventType);
      }

      return { success: true, message: 'Webhook processado com sucesso' };
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      return { success: false, message: 'Erro ao processar webhook' };
    }
  }

  // Lidar com pagamento completado
  private async handlePaymentCompleted(payload: any): Promise<void> {
    const payment = payload.payment || payload;
    
    // Obter faturas do localStorage
    const invoices = this.getInvoices();
    const clients = this.getClients();

    // Procurar fatura pelo ID externo
    const invoiceIndex = invoices.findIndex(inv => 
      inv.id === payment.external_id || 
      inv.id === payment.invoice_id ||
      inv.description?.includes(payment.id)
    );

    if (invoiceIndex >= 0) {
      // Atualizar fatura existente
      invoices[invoiceIndex] = {
        ...invoices[invoiceIndex],
        status: 'paid' as const,
        paymentMethod: 'cakto',
        transactionId: payment.id || payment.transaction_id
      };
    } else {
      // Criar nova fatura
      const client = this.findOrCreateClient(payment, clients);
      
      const newInvoice: Invoice = {
        id: payment.id || Date.now().toString(),
        clientId: client.id,
        clientName: client.name,
        amount: parseFloat(payment.amount) || 0,
        dueDate: payment.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'paid' as const,
        description: payment.description || `Pagamento via Cakto - ${payment.id}`,
        paymentMethod: 'cakto',
        transactionId: payment.id || payment.transaction_id
      };

      invoices.push(newInvoice);
    }

    // Salvar no localStorage
    localStorage.setItem('crm_invoices', JSON.stringify(invoices));
    localStorage.setItem('crm_clients', JSON.stringify(clients));

    console.log('Pagamento completado processado');
  }

  // Lidar com pagamento falhado
  private async handlePaymentFailed(payload: any): Promise<void> {
    const payment = payload.payment || payload;
    
    const invoices = this.getInvoices();

    const invoiceIndex = invoices.findIndex(inv => 
      inv.id === payment.external_id || 
      inv.id === payment.invoice_id ||
      inv.description?.includes(payment.id)
    );

    if (invoiceIndex >= 0) {
      invoices[invoiceIndex] = {
        ...invoices[invoiceIndex],
        status: 'overdue' as const,
        paymentMethod: 'cakto',
        transactionId: payment.id || payment.transaction_id
      };

      localStorage.setItem('crm_invoices', JSON.stringify(invoices));
    }

    console.log('Pagamento falhado processado');
  }

  // Lidar com pagamento pendente
  private async handlePaymentPending(payload: any): Promise<void> {
    const payment = payload.payment || payload;
    
    const invoices = this.getInvoices();

    const invoiceIndex = invoices.findIndex(inv => 
      inv.id === payment.external_id || 
      inv.id === payment.invoice_id ||
      inv.description?.includes(payment.id)
    );

    if (invoiceIndex >= 0) {
      invoices[invoiceIndex] = {
        ...invoices[invoiceIndex],
        status: 'pending' as const,
        paymentMethod: 'cakto',
        transactionId: payment.id || payment.transaction_id
      };

      localStorage.setItem('crm_invoices', JSON.stringify(invoices));
    }

    console.log('Pagamento pendente processado');
  }

  // Encontrar ou criar cliente
  private findOrCreateClient(payment: any, clients: Client[]): Client {
    const customerEmail = payment.customer?.email || payment.email;
    
    let client = clients.find(c => c.email === customerEmail);

    if (!client) {
      client = {
        id: Date.now().toString(),
        name: payment.customer?.name || payment.name || 'Cliente Cakto',
        email: customerEmail,
        phone: payment.customer?.phone || payment.phone || '',
        company: payment.customer?.company || '',
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        totalSpent: 0
      };

      clients.push(client);
    }

    return client;
  }

  // Obter faturas do localStorage
  private getInvoices(): Invoice[] {
    try {
      const invoices = localStorage.getItem('crm_invoices');
      return invoices ? JSON.parse(invoices) : [];
    } catch (error) {
      console.error('Erro ao carregar faturas:', error);
      return [];
    }
  }

  // Obter clientes do localStorage
  private getClients(): Client[] {
    try {
      const clients = localStorage.getItem('crm_clients');
      return clients ? JSON.parse(clients) : [];
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      return [];
    }
  }

  // Gerar URL de pagamento Cakto
  generateCaktoPaymentUrl(invoice: Invoice): string {
    // URL base do Cakto (substituir pela URL real)
    const baseUrl = 'https://cakto.com.br/payment';
    
    // Parâmetros do pagamento
    const params = new URLSearchParams({
      amount: invoice.amount.toString(),
      description: invoice.description,
      external_id: invoice.id,
      customer_email: invoice.clientEmail || '',
      // Adicionar outros parâmetros necessários
    });

    return `${baseUrl}?${params.toString()}`;
  }

  // Criar link de pagamento para cliente
  createPaymentLink(invoice: Invoice): string {
    const paymentUrl = this.generateCaktoPaymentUrl(invoice);
    
    // Opcional: encurtar URL ou adicionar tracking
    return paymentUrl;
  }
}

// Exportar instância singleton
export const webhookService = WebhookService.getInstance();
