-- CRM PMG - Estrutura Completa do Banco (Versão Corrigida para Supabase)

-- 1. CRIAR EXTENSIONS NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CRIAR TIPOS ENUM
CREATE TYPE user_role AS ENUM ('ADMIN', 'MANAGER', 'SALES', 'SUPPORT');
CREATE TYPE customer_status AS ENUM ('LEAD', 'PROSPECT', 'ACTIVE', 'INACTIVE', 'LOST');
CREATE TYPE deal_stage AS ENUM ('LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST');
CREATE TYPE activity_type AS ENUM ('CALL', 'EMAIL', 'MEETING', 'TASK', 'NOTE');

-- 3. CRIAR TABELAS

-- Tabela de Usuários
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'SALES',
    avatar_url TEXT,
    phone VARCHAR(20),
    department VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Tabela de Clientes
CREATE TABLE customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    company VARCHAR(255),
    position VARCHAR(255),
    website VARCHAR(255),
    linkedin VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    status customer_status DEFAULT 'LEAD',
    source VARCHAR(100),
    industry VARCHAR(100),
    size VARCHAR(50),
    annual_revenue DECIMAL(15,2),
    description TEXT,
    tags TEXT[],
    creator_id UUID REFERENCES users(id),
    assignee_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_contact TIMESTAMP WITH TIME ZONE
);

-- Tabela de Negócios (Deals)
CREATE TABLE deals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    value DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'BRL',
    stage deal_stage DEFAULT 'LEAD',
    probability INTEGER DEFAULT 0,
    expected_close_date DATE,
    actual_close_date DATE,
    lost_reason TEXT,
    customer_id UUID REFERENCES customers(id),
    assignee_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Atividades
CREATE TABLE activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type activity_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration INTEGER,
    location VARCHAR(255),
    is_completed BOOLEAN DEFAULT false,
    outcome TEXT,
    notes TEXT,
    customer_id UUID REFERENCES customers(id),
    deal_id UUID REFERENCES deals(id),
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Produtos/Serviços
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE,
    price DECIMAL(15,2),
    cost DECIMAL(15,2),
    category VARCHAR(100),
    unit VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Itens de Negócio
CREATE TABLE deal_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity DECIMAL(10,2) DEFAULT 1,
    unit_price DECIMAL(15,2),
    discount DECIMAL(5,2) DEFAULT 0,
    total_price DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Notas
CREATE TABLE notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content TEXT NOT NULL,
    customer_id UUID REFERENCES customers(id),
    deal_id UUID REFERENCES deals(id),
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Anexos
CREATE TABLE attachments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    file_size INTEGER,
    mime_type VARCHAR(100),
    file_url TEXT,
    customer_id UUID REFERENCES customers(id),
    deal_id UUID REFERENCES deals(id),
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CRIAR ÍNDICES
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_assignee ON customers(assignee_id);
CREATE INDEX idx_deals_customer ON deals(customer_id);
CREATE INDEX idx_deals_assignee ON deals(assignee_id);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_activities_customer ON activities(customer_id);
CREATE INDEX idx_activities_user ON activities(user_id);
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_scheduled ON activities(scheduled_at);

-- 5. CRIAR TRIGGERS PARA UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deal_items_updated_at BEFORE UPDATE ON deal_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. INSERIR DADOS INICIAIS

-- Inserir usuários
INSERT INTO users (email, name, password_hash, role, department) VALUES
('admin@crmpmg.com', 'Administrador CRM', crypt('Admin@2024!', gen_salt('bf')), 'ADMIN', 'TI'),
('usuario@crmpmg.com', 'Usuário Teste', crypt('Usuario@2024!', gen_salt('bf')), 'SALES', 'Vendas'),
('joao.silva@crmpmg.com', 'João Silva', crypt('Joao@2024!', gen_salt('bf')), 'SALES', 'Vendas'),
('maria.santos@crmpmg.com', 'Maria Santos', crypt('Maria@2024!', gen_salt('bf')), 'MANAGER', 'Vendas');

-- Inserir clientes de exemplo
INSERT INTO customers (name, email, phone, company, position, status, source, creator_id, assignee_id) VALUES
('João Carlos Silva', 'joao.silva@techsolutions.com', '+55 11 98765-4321', 'Tech Solutions Ltda', 'CEO', 'ACTIVE', 'Website', (SELECT id FROM users WHERE email = 'admin@crmpmg.com'), (SELECT id FROM users WHERE email = 'joao.silva@crmpmg.com')),
('Maria Fernanda Santos', 'maria.santos@comerciodigital.com', '+55 11 91234-5678', 'Comércio Digital SA', 'Diretora Comercial', 'ACTIVE', 'Indicação', (SELECT id FROM users WHERE email = 'admin@crmpmg.com'), (SELECT id FROM users WHERE email = 'maria.santos@crmpmg.com')),
('Carlos Alberto Oliveira', 'carlos.oliveira@servicosonline.com', '+55 11 99876-5432', 'Serviços Online ME', 'Gerente', 'PROSPECT', 'LinkedIn', (SELECT id FROM users WHERE email = 'admin@crmpmg.com'), (SELECT id FROM users WHERE email = 'joao.silva@crmpmg.com')),
('Ana Paula Costa', 'ana.costa@startup.com', '+55 11 97654-3210', 'Startup Tech Innovation', 'CTO', 'LEAD', 'Evento', (SELECT id FROM users WHERE email = 'admin@crmpmg.com'), (SELECT id FROM users WHERE email = 'maria.santos@crmpmg.com'));

-- Inserir produtos de exemplo
INSERT INTO products (name, description, sku, price, cost, category, unit) VALUES
('CRM Enterprise', 'Sistema completo de gestão de relacionamento com clientes', 'CRM-001', 75000.00, 25000.00, 'Software', 'Licença'),
('E-commerce Pro', 'Plataforma de e-commerce completa com integrações', 'ECO-001', 45000.00, 15000.00, 'Software', 'Licença'),
('Consultoria Digital', 'Pacote de 40 horas de consultoria em transformação digital', 'CON-001', 38000.00, 12000.00, 'Serviços', 'Horas'),
('Desenvolvimento Customizado', 'Desenvolvimento de aplicação sob medida', 'DEV-001', 65000.00, 28000.00, 'Serviços', 'Projeto'),
('Marketing Digital', 'Gestão completa de marketing digital por 6 meses', 'MKT-001', 28000.00, 8000.00, 'Marketing', 'Pacote');

-- Inserir negócios de exemplo
INSERT INTO deals (title, description, value, stage, probability, expected_close_date, customer_id, assignee_id) VALUES
('Implementação CRM Enterprise', 'Implementação completa do sistema CRM Enterprise para Tech Solutions', 75000.00, 'QUALIFIED', 85, '2024-06-30', (SELECT id FROM customers WHERE email = 'joao.silva@techsolutions.com'), (SELECT id FROM users WHERE email = 'joao.silva@crmpmg.com')),
('E-commerce Pro - Comércio Digital', 'Desenvolvimento de plataforma e-commerce completa', 45000.00, 'PROPOSAL', 60, '2024-07-15', (SELECT id FROM customers WHERE email = 'maria.santos@comerciodigital.com'), (SELECT id FROM users WHERE email = 'maria.santos@crmpmg.com')),
('Consultoria Digital - Serviços Online', 'Pacote de consultoria em transformação digital', 38000.00, 'QUALIFIED', 90, '2024-06-15', (SELECT id FROM customers WHERE email = 'carlos.oliveira@servicosonline.com'), (SELECT id FROM users WHERE email = 'joao.silva@crmpmg.com')),
('Desenvolvimento App - Startup Tech', 'Desenvolvimento de aplicação mobile customizada', 65000.00, 'NEGOTIATION', 75, '2024-08-30', (SELECT id FROM customers WHERE email = 'ana.costa@startup.com'), (SELECT id FROM users WHERE email = 'maria.santos@crmpmg.com'));

-- Inserir itens dos negócios
INSERT INTO deal_items (deal_id, product_id, quantity, unit_price, total_price) VALUES
((SELECT id FROM deals WHERE title = 'Implementação CRM Enterprise'), (SELECT id FROM products WHERE sku = 'CRM-001'), 1, 75000.00, 75000.00),
((SELECT id FROM deals WHERE title = 'E-commerce Pro - Comércio Digital'), (SELECT id FROM products WHERE sku = 'ECO-001'), 1, 45000.00, 45000.00),
((SELECT id FROM deals WHERE title = 'Consultoria Digital - Serviços Online'), (SELECT id FROM products WHERE sku = 'CON-001'), 1, 38000.00, 38000.00),
((SELECT id FROM deals WHERE title = 'Desenvolvimento App - Startup Tech'), (SELECT id FROM products WHERE sku = 'DEV-001'), 1, 65000.00, 65000.00);

-- Inserir atividades de exemplo
INSERT INTO activities (type, title, description, scheduled_at, duration, customer_id, deal_id, user_id) VALUES
('CALL', 'Ligação de follow-up', 'Follow-up sobre proposta do CRM Enterprise', '2024-05-01 10:00:00', 30, (SELECT id FROM customers WHERE email = 'joao.silva@techsolutions.com'), (SELECT id FROM deals WHERE title = 'Implementação CRM Enterprise'), (SELECT id FROM users WHERE email = 'joao.silva@crmpmg.com')),
('EMAIL', 'Enviar proposta final', 'Enviar proposta final do E-commerce Pro', '2024-05-01 14:00:00', 15, (SELECT id FROM customers WHERE email = 'maria.santos@comerciodigital.com'), (SELECT id FROM deals WHERE title = 'E-commerce Pro - Comércio Digital'), (SELECT id FROM users WHERE email = 'maria.santos@crmpmg.com')),
('MEETING', 'Reunião de apresentação', 'Apresentação técnica da consultoria', '2024-05-02 09:00:00', 60, (SELECT id FROM customers WHERE email = 'carlos.oliveira@servicosonline.com'), (SELECT id FROM deals WHERE title = 'Consultoria Digital - Serviços Online'), (SELECT id FROM users WHERE email = 'joao.silva@crmpmg.com')),
('TASK', 'Revisão contrato', 'Revisar contrato de desenvolvimento', '2024-05-01 16:00:00', 45, (SELECT id FROM customers WHERE email = 'ana.costa@startup.com'), (SELECT id FROM deals WHERE title = 'Desenvolvimento App - Startup Tech'), (SELECT id FROM users WHERE email = 'maria.santos@crmpmg.com'));

-- Inserir notas de exemplo
INSERT INTO notes (content, customer_id, deal_id, user_id) VALUES
('Cliente muito interessado, precisa apenas de aprovação do CFO', (SELECT id FROM customers WHERE email = 'joao.silva@techsolutions.com'), (SELECT id FROM deals WHERE title = 'Implementação CRM Enterprise'), (SELECT id FROM users WHERE email = 'joao.silva@crmpmg.com')),
('Possível fechamento até final do mês, aguardando contraproposta', (SELECT id FROM customers WHERE email = 'maria.santos@comerciodigital.com'), (SELECT id FROM deals WHERE title = 'E-commerce Pro - Comércio Digital'), (SELECT id FROM users WHERE email = 'maria.santos@crmpmg.com')),
('Cliente tem urgência, pode fechar com desconto de 10%', (SELECT id FROM customers WHERE email = 'carlos.oliveira@servicosonline.com'), (SELECT id FROM deals WHERE title = 'Consultoria Digital - Serviços Online'), (SELECT id FROM users WHERE email = 'joao.silva@crmpmg.com'));

-- 7. CRIAR VIEWS ÚTEIS

-- View de métricas do dashboard
CREATE VIEW dashboard_metrics AS
SELECT 
    (SELECT COUNT(*) FROM customers WHERE status = 'ACTIVE') as active_customers,
    (SELECT COUNT(*) FROM customers) as total_customers,
    (SELECT COUNT(*) FROM deals WHERE stage IN ('QUALIFIED', 'PROPOSAL', 'NEGOTIATION')) as active_deals,
    (SELECT COUNT(*) FROM deals) as total_deals,
    (SELECT COALESCE(SUM(value), 0) FROM deals WHERE stage IN ('QUALIFIED', 'PROPOSAL', 'NEGOTIATION')) as pipeline_value,
    (SELECT COALESCE(SUM(value), 0) FROM deals WHERE stage = 'CLOSED_WON' AND created_at >= date_trunc('month', CURRENT_DATE)) as won_this_month,
    (SELECT COUNT(*) FROM activities WHERE is_completed = false AND scheduled_at <= NOW()) as overdue_activities,
    (SELECT COUNT(*) FROM activities WHERE scheduled_at >= date_trunc('month', CURRENT_DATE)) as activities_this_month;

-- View de pipeline por estágio
CREATE VIEW pipeline_by_stage AS
SELECT 
    stage,
    COUNT(*) as deal_count,
    COALESCE(SUM(value), 0) as total_value,
    ROUND(AVG(probability), 1) as avg_probability
FROM deals 
GROUP BY stage
ORDER BY stage;

-- 8. CRIAR POLÍTICAS DE SEGURANÇA (RLS)

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = email::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = email::text);

-- Políticas para clientes
CREATE POLICY "Authenticated users can view customers" ON customers
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert customers" ON customers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own customers" ON customers
    FOR UPDATE USING (assignee_id = auth.uid() OR creator_id = auth.uid());

-- Políticas para deals
CREATE POLICY "Authenticated users can view deals" ON deals
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert deals" ON deals
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own deals" ON deals
    FOR UPDATE USING (assignee_id = auth.uid());

-- Políticas para activities
CREATE POLICY "Authenticated users can view activities" ON activities
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert activities" ON activities
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own activities" ON activities
    FOR UPDATE USING (user_id = auth.uid());

-- 9. CRIAR FUNÇÕES ÚTEIS

-- Função para autenticação
CREATE OR REPLACE FUNCTION authenticate_user(email_param TEXT, password_param TEXT)
RETURNS TABLE (
    user_id UUID,
    user_email TEXT,
    user_name TEXT,
    user_role user_role,
    is_authenticated BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.name,
        u.role,
        (u.password_hash = crypt(password_param, u.password_hash)) as is_authenticated
    FROM users u
    WHERE u.email = email_param AND u.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para métricas do usuário
CREATE OR REPLACE FUNCTION get_user_metrics(user_id_param UUID)
RETURNS TABLE (
    total_customers INTEGER,
    active_deals INTEGER,
    pipeline_value DECIMAL,
    activities_today INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM customers WHERE assignee_id = user_id_param),
        (SELECT COUNT(*) FROM deals WHERE assignee_id = user_id_param AND stage IN ('QUALIFIED', 'PROPOSAL', 'NEGOTIATION')),
        (SELECT COALESCE(SUM(value), 0) FROM deals WHERE assignee_id = user_id_param AND stage IN ('QUALIFIED', 'PROPOSAL', 'NEGOTIATION')),
        (SELECT COUNT(*) FROM activities WHERE user_id = user_id_param AND scheduled_at::date = CURRENT_DATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. CONFIGURAÇÃO FINAL
-- Criar função para reset de senha (admin only)
CREATE OR REPLACE FUNCTION reset_password(email_param TEXT, new_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE users 
    SET password_hash = crypt(new_password, gen_salt('bf'))
    WHERE email = email_param AND role = 'ADMIN';
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- VERIFICAÇÃO FINAL
SELECT 'CRM PMG Database Setup Completed Successfully!' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_customers FROM customers;
SELECT COUNT(*) as total_deals FROM deals;
SELECT COUNT(*) as total_activities FROM activities;
