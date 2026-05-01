import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {
  try {
    // Log da requisição recebida
    console.log("Webhook Cakto recebido:", {
      method: req.method,
      headers: Object.fromEntries(req.headers.entries()),
      url: req.url
    });

    // Verificar se é um método POST
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Método não permitido" }), {
        status: 405,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Parse do corpo da requisição
    const body = await req.json();
    console.log("Dados do webhook:", body);

    // Validar se tem os campos necessários
    if (!body.event) {
      return new Response(JSON.stringify({ error: "Campo 'event' é obrigatório" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Criar cliente Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Processar diferentes eventos do Cakto
    switch (body.event) {
      case "purchase_approved":
        await handlePurchaseApproved(supabase, body);
        break;
      
      case "purchase_cancelled":
        await handlePurchaseCancelled(supabase, body);
        break;
      
      case "subscription_created":
        await handleSubscriptionCreated(supabase, body);
        break;
      
      case "subscription_cancelled":
        await handleSubscriptionCancelled(supabase, body);
        break;
      
      default:
        console.log("Evento não tratado:", body.event);
        return new Response(JSON.stringify({ message: "Evento não tratado" }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
    }

    // Resposta de sucesso
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Webhook processado com sucesso",
      event: body.event 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Erro ao processar webhook:", error);
    
    return new Response(JSON.stringify({ 
      error: "Erro interno do servidor",
      details: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});

// Função para tratar pagamento aprovado
async function handlePurchaseApproved(supabase: any, body: any) {
  console.log("Processando pagamento aprovado:", body.customer.email);

  const { data, error } = await supabase
    .from("subscriptions")
    .upsert({
      email: body.customer.email,
      customer_id: body.customer.id,
      plan: "premium",
      status: "active",
      purchase_id: body.purchase?.id,
      amount: body.purchase?.amount,
      currency: body.purchase?.currency || "BRL",
      payment_method: body.purchase?.payment_method,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select();

  if (error) {
    console.error("Erro ao inserir subscription:", error);
    throw error;
  }

  console.log("Subscription criada/atualizada:", data);

  // Opcional: Atualizar o perfil do usuário para premium
  const { error: userError } = await supabase
    .from("profiles")
    .update({ 
      subscription_tier: "premium",
      updated_at: new Date().toISOString()
    })
    .eq("email", body.customer.email);

  if (userError) {
    console.error("Erro ao atualizar perfil do usuário:", userError);
    // Não lançar erro, pois a subscription já foi criada
  }
}

// Função para tratar pagamento cancelado
async function handlePurchaseCancelled(supabase: any, body: any) {
  console.log("Processando pagamento cancelado:", body.customer.email);

  const { data, error } = await supabase
    .from("subscriptions")
    .update({ 
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("customer_id", body.customer.id);

  if (error) {
    console.error("Erro ao cancelar subscription:", error);
    throw error;
  }

  console.log("Subscription cancelada:", data);
}

// Função para tratar subscription criada
async function handleSubscriptionCreated(supabase: any, body: any) {
  console.log("Processando subscription criada:", body.customer.email);

  const { data, error } = await supabase
    .from("subscriptions")
    .upsert({
      email: body.customer.email,
      customer_id: body.customer.id,
      plan: body.subscription?.plan || "premium",
      status: "active",
      subscription_id: body.subscription?.id,
      amount: body.subscription?.amount,
      currency: body.subscription?.currency || "BRL",
      interval: body.subscription?.interval || "monthly",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select();

  if (error) {
    console.error("Erro ao criar subscription:", error);
    throw error;
  }

  console.log("Subscription criada:", data);
}

// Função para tratar subscription cancelada
async function handleSubscriptionCancelled(supabase: any, body: any) {
  console.log("Processando subscription cancelada:", body.customer.email);

  const { data, error } = await supabase
    .from("subscriptions")
    .update({ 
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("subscription_id", body.subscription?.id);

  if (error) {
    console.error("Erro ao cancelar subscription:", error);
    throw error;
  }

  console.log("Subscription cancelada:", data);
}
