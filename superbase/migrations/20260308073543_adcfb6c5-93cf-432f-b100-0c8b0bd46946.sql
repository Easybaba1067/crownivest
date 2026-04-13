
-- 1. Profiles table (investor/user accounts)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  kyc_status TEXT NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  accredited_investor BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Admins can read all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''), NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Properties table
CREATE TYPE public.property_status AS ENUM ('draft', 'funding', 'funded', 'completed', 'cancelled');
CREATE TYPE public.property_type AS ENUM ('residential', 'commercial', 'retail', 'mixed_use', 'industrial');

CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  property_type property_type NOT NULL DEFAULT 'residential',
  status property_status NOT NULL DEFAULT 'draft',
  target_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  raised_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  min_investment NUMERIC(15,2) NOT NULL DEFAULT 100,
  roi NUMERIC(5,2),
  investors_count INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active properties" ON public.properties FOR SELECT USING (status != 'draft');
CREATE POLICY "Admins can do everything on properties" ON public.properties FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 3. Property media
CREATE TABLE public.property_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video', 'document')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.property_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read property media" ON public.property_media FOR SELECT USING (true);
CREATE POLICY "Admins can manage property media" ON public.property_media FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 4. Wallets
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own wallet" ON public.wallets FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can read all wallets" ON public.wallets FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage wallets" ON public.wallets FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Auto-create wallet on profile creation
CREATE OR REPLACE FUNCTION public.handle_new_wallet()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.wallets (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_wallet();

-- 5. Investments
CREATE TYPE public.investment_status AS ENUM ('pending', 'active', 'completed', 'cancelled');

CREATE TABLE public.investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  status investment_status NOT NULL DEFAULT 'pending',
  invested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own investments" ON public.investments FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own investments" ON public.investments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage all investments" ON public.investments FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 6. Transactions
CREATE TYPE public.transaction_type AS ENUM ('deposit', 'withdrawal', 'investment', 'return', 'payout', 'refund');

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE,
  investment_id UUID REFERENCES public.investments(id) ON DELETE SET NULL,
  type transaction_type NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions" ON public.transactions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage all transactions" ON public.transactions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 7. Payouts (ROI payments)
CREATE TYPE public.payout_status AS ENUM ('scheduled', 'processing', 'completed', 'failed');

CREATE TABLE public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_id UUID REFERENCES public.investments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  status payout_status NOT NULL DEFAULT 'scheduled',
  scheduled_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own payouts" ON public.payouts FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all payouts" ON public.payouts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 8. Notifications
CREATE TYPE public.notification_channel AS ENUM ('email', 'sms', 'in_app');
CREATE TYPE public.notification_status AS ENUM ('pending', 'sent', 'failed');

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  channel notification_channel NOT NULL DEFAULT 'in_app',
  title TEXT NOT NULL,
  message TEXT,
  status notification_status NOT NULL DEFAULT 'pending',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all notifications" ON public.notifications FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 9. Blog posts
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  excerpt TEXT,
  cover_image_url TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published posts" ON public.blog_posts FOR SELECT USING (published = true);
CREATE POLICY "Admins can manage all posts" ON public.blog_posts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 10. Documents (contracts, valuation reports)
CREATE TYPE public.document_type AS ENUM ('contract', 'valuation_report', 'prospectus', 'financial_projection', 'legal', 'other');

CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  investment_id UUID REFERENCES public.investments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  doc_type document_type NOT NULL DEFAULT 'other',
  file_url TEXT NOT NULL,
  public_access BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own documents" ON public.documents FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Anyone can read public documents" ON public.documents FOR SELECT USING (public_access = true);
CREATE POLICY "Admins can manage all documents" ON public.documents FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
