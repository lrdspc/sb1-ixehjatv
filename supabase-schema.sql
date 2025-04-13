-- Criação das tabelas para o projeto de inspeção

-- Tabela de perfis de usuários (extensão da tabela auth.users do Supabase)
CREATE TABLE IF NOT EXISTS users_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de inspeções
CREATE TABLE IF NOT EXISTS inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft',
  inspection_date DATE NOT NULL,
  building_type TEXT NOT NULL,
  construction_year INTEGER,
  roof_area NUMERIC NOT NULL,
  last_maintenance DATE,
  main_issue TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de telhas da inspeção
CREATE TABLE IF NOT EXISTS inspection_tiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  line TEXT NOT NULL,
  thickness TEXT NOT NULL,
  dimensions TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  area NUMERIC NOT NULL
);

-- Tabela de não conformidades
CREATE TABLE IF NOT EXISTS nonconformities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de fotos da inspeção
CREATE TABLE IF NOT EXISTS inspection_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  nonconformity_id UUID REFERENCES nonconformities(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  caption TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar políticas de segurança RLS (Row Level Security)

-- Habilitar RLS em todas as tabelas
ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_tiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE nonconformities ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_photos ENABLE ROW LEVEL SECURITY;

-- Política para usuários autenticados verem seus próprios perfis
CREATE POLICY "Usuários podem ver seus próprios perfis" ON users_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Política para usuários autenticados atualizarem seus próprios perfis
CREATE POLICY "Usuários podem atualizar seus próprios perfis" ON users_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para usuários autenticados verem todos os clientes
CREATE POLICY "Usuários autenticados podem ver todos os clientes" ON clients
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para usuários autenticados criarem clientes
CREATE POLICY "Usuários autenticados podem criar clientes" ON clients
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para usuários autenticados atualizarem clientes
CREATE POLICY "Usuários autenticados podem atualizar clientes" ON clients
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para usuários autenticados verem todas as inspeções
CREATE POLICY "Usuários autenticados podem ver todas as inspeções" ON inspections
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para usuários autenticados criarem inspeções
CREATE POLICY "Usuários autenticados podem criar inspeções" ON inspections
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para usuários autenticados atualizarem inspeções
CREATE POLICY "Usuários autenticados podem atualizar inspeções" ON inspections
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Políticas similares para as outras tabelas
CREATE POLICY "Usuários autenticados podem ver telhas" ON inspection_tiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem criar telhas" ON inspection_tiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar telhas" ON inspection_tiles
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem ver não conformidades" ON nonconformities
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem criar não conformidades" ON nonconformities
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar não conformidades" ON nonconformities
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem ver fotos" ON inspection_photos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem criar fotos" ON inspection_photos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar fotos" ON inspection_photos
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Trigger para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar o trigger às tabelas que têm o campo updated_at
CREATE TRIGGER update_clients_modtime
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_inspections_modtime
  BEFORE UPDATE ON inspections
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_users_profiles_modtime
  BEFORE UPDATE ON users_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();
