-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_admin BOOLEAN DEFAULT FALSE,
    total_games_played INTEGER DEFAULT 0,
    total_wins INTEGER DEFAULT 0,
    total_bitcoins_earned BIGINT DEFAULT 0,
    rank INTEGER DEFAULT 1000
);

-- Create game rooms table
CREATE TABLE public.game_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    max_players INTEGER DEFAULT 4,
    current_players INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'waiting', -- waiting, playing, finished
    game_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create game participants table
CREATE TABLE public.game_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.game_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    player_data JSONB,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

-- Create leaderboard table
CREATE TABLE public.leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    game_room_id UUID REFERENCES public.game_rooms(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    bitcoins_earned INTEGER NOT NULL,
    properties_owned INTEGER NOT NULL,
    game_duration_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create CTF challenges table
CREATE TABLE public.ctf_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(20) NOT NULL, -- easy, medium, hard, expert
    category VARCHAR(50) NOT NULL, -- web, crypto, reverse, pwn, forensics
    reward_bitcoins INTEGER NOT NULL,
    hint TEXT,
    solution TEXT NOT NULL,
    flag VARCHAR(100) NOT NULL,
    created_by UUID REFERENCES public.profiles(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create support tickets table
CREATE TABLE public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
    status VARCHAR(20) DEFAULT 'open', -- open, in_progress, resolved, closed
    assigned_to UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create support ticket messages table
CREATE TABLE public.support_ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trade offers table
CREATE TABLE public.trade_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_room_id UUID REFERENCES public.game_rooms(id) ON DELETE CASCADE,
    from_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    to_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    offered_properties JSONB,
    offered_bitcoins INTEGER DEFAULT 0,
    requested_properties JSONB,
    requested_bitcoins INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected, expired
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 minutes'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ctf_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_offers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Anyone can view public profile data" ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can view game rooms" ON public.game_rooms FOR SELECT USING (true);
CREATE POLICY "Users can create game rooms" ON public.game_rooms FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Host can update game rooms" ON public.game_rooms FOR UPDATE USING (auth.uid() = host_id);

CREATE POLICY "Users can view their game participation" ON public.game_participants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can join games" ON public.game_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view leaderboard" ON public.leaderboard FOR SELECT USING (true);
CREATE POLICY "System can insert leaderboard entries" ON public.leaderboard FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view active challenges" ON public.ctf_challenges FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage challenges" ON public.ctf_challenges FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Users can view their own tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all tickets" ON public.support_tickets FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_game_rooms_status ON public.game_rooms(status);
CREATE INDEX idx_leaderboard_bitcoins ON public.leaderboard(bitcoins_earned DESC);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_trade_offers_status ON public.trade_offers(status);
