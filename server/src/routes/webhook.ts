import express from 'express';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Webhook para receber notificações do Cakto
router.post('/cakto', async (req, res) => {
  try {
    const signature = req.headers['x-cakto-signature'] as string;
    const payload = req.body;

    // Verificar assinatura do webhook (se o Cakto enviar)
    if (signature) {
      const webhookSecret = process.env.CAKTO_WEBHOOK_SECRET || '';
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('Assinatura do webhook inválida');
        return res.status(401).json({ error: 'Assinatura inválida' });
      }
    }

    console.log('Webhook recebido:', payload);

    // Processar diferentes tipos de eventos do Cakto
    const eventType = payload.event || payload.type;

    switch (eventType) {
      case 'payment.completed':
        await handlePaymentCompleted(payload);
        break;
      case 'payment.failed':
        await handlePaymentFailed(payload);
        break;
      case 'payment.pending':
        await handlePaymentPending(payload);
        break;
      case 'subscription.created':
        await handleSubscriptionCreated(payload);
        break;
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(payload);
        break;
      default:
        console.log('Evento não tratado:', eventType);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// Função para processar pagamento completado
async function handlePaymentCompleted(payload: any) {
  try {
    const payment = payload.payment || payload;
    
    // Atualizar status da fatura no banco de dados
    if (payment.external_id || payment.invoice_id) {
      const invoiceId = payment.external_id || payment.invoice_id;
      
      // Procurar fatura pelo ID externo ou ID da fatura
      let invoice = await prisma.invoice.findFirst({
        where: {
          OR: [
            { externalId: invoiceId },
            { id: invoiceId }
          ]
        }
      });

      if (invoice) {
        // Atualizar status para pago
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            status: 'PAID',
            paidAt: new Date(),
            paymentMethod: 'cakto',
            transactionId: payment.id || payment.transaction_id
          }
        });

        console.log(`Fatura ${invoice.id} marcada como paga`);
      } else {
        // Criar nova fatura se não existir
        await createInvoiceFromPayment(payment);
      }
    }

    // Enviar notificação (opcional)
    await sendPaymentNotification(payment, 'completed');
  } catch (error) {
    console.error('Erro ao processar pagamento completado:', error);
  }
}

// Função para processar pagamento falhado
async function handlePaymentFailed(payload: any) {
  try {
    const payment = payload.payment || payload;
    
    if (payment.external_id || payment.invoice_id) {
      const invoiceId = payment.external_id || payment.invoice_id;
      
      const invoice = await prisma.invoice.findFirst({
        where: {
          OR: [
            { externalId: invoiceId },
            { id: invoiceId }
          ]
        }
      });

      if (invoice) {
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            status: 'FAILED',
            paymentMethod: 'cakto',
            transactionId: payment.id || payment.transaction_id
          }
        });

        console.log(`Fatura ${invoice.id} marcada como falha`);
      }
    }

    await sendPaymentNotification(payment, 'failed');
  } catch (error) {
    console.error('Erro ao processar pagamento falhado:', error);
  }
}

// Função para processar pagamento pendente
async function handlePaymentPending(payload: any) {
  try {
    const payment = payload.payment || payload;
    
    if (payment.external_id || payment.invoice_id) {
      const invoiceId = payment.external_id || payment.invoice_id;
      
      const invoice = await prisma.invoice.findFirst({
        where: {
          OR: [
            { externalId: invoiceId },
            { id: invoiceId }
          ]
        }
      });

      if (invoice) {
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            status: 'PENDING',
            paymentMethod: 'cakto',
            transactionId: payment.id || payment.transaction_id
          }
        });

        console.log(`Fatura ${invoice.id} marcada como pendente`);
      }
    }

    await sendPaymentNotification(payment, 'pending');
  } catch (error) {
    console.error('Erro ao processar pagamento pendente:', error);
  }
}

// Função para criar fatura a partir do pagamento
async function createInvoiceFromPayment(payment: any) {
  try {
    const customerEmail = payment.customer?.email || payment.email;
    
    // Procurar cliente pelo email
    let customer = await prisma.customer.findFirst({
      where: { email: customerEmail }
    });

    if (!customer) {
      // Criar cliente se não existir
      customer = await prisma.customer.create({
        data: {
          name: payment.customer?.name || payment.name || 'Cliente Cakto',
          email: customerEmail,
          phone: payment.customer?.phone || payment.phone,
          company: payment.customer?.company || '',
          status: 'ACTIVE',
          createdBy: 'system' // ID do usuário sistema ou admin
        }
      });
    }

    // Criar fatura
    await prisma.invoice.create({
      data: {
        customerId: customer.id,
        amount: parseFloat(payment.amount) || 0,
        dueDate: new Date(payment.due_date || Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'PAID',
        description: payment.description || `Pagamento via Cakto - ${payment.id}`,
        externalId: payment.id || payment.external_id,
        paymentMethod: 'cakto',
        transactionId: payment.id || payment.transaction_id,
        paidAt: new Date(),
        createdBy: 'system' // ID do usuário sistema ou admin
      }
    });

    console.log(`Fatura criada para cliente ${customer.id}`);
  } catch (error) {
    console.error('Erro ao criar fatura do pagamento:', error);
  }
}

// Função para processar assinatura criada
async function handleSubscriptionCreated(payload: any) {
  try {
    const subscription = payload.subscription || payload;
    console.log('Assinatura criada:', subscription);
    
    // Aqui você pode implementar lógica para assinaturas
    // Por exemplo: criar plano premium para o cliente
    await sendSubscriptionNotification(subscription, 'created');
  } catch (error) {
    console.error('Erro ao processar assinatura criada:', error);
  }
}

// Função para processar assinatura cancelada
async function handleSubscriptionCancelled(payload: any) {
  try {
    const subscription = payload.subscription || payload;
    console.log('Assinatura cancelada:', subscription);
    
    // Aqui você pode implementar lógica para cancelamento
    // Por exemplo: rebaixar plano do cliente
    await sendSubscriptionNotification(subscription, 'cancelled');
  } catch (error) {
    console.error('Erro ao processar assinatura cancelada:', error);
  }
}

// Função para enviar notificações (opcional)
async function sendPaymentNotification(payment: any, status: string) {
  try {
    // Aqui você pode implementar envio de email, SMS, etc.
    console.log(`Notificação de pagamento ${status}:`, payment);
    
    // Exemplo: enviar email
    // await emailService.sendPaymentNotification(payment, status);
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
  }
}

// Função para enviar notificações de assinatura
async function sendSubscriptionNotification(subscription: any, status: string) {
  try {
    console.log(`Notificação de assinatura ${status}:`, subscription);
    
    // Exemplo: enviar email
    // await emailService.sendSubscriptionNotification(subscription, status);
  } catch (error) {
    console.error('Erro ao enviar notificação de assinatura:', error);
  }
}

// Webhook para testes
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Webhook endpoint funcionando',
    timestamp: new Date().toISOString()
  });
});

export default router;
