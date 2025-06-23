-- Insert sample CTF challenges
INSERT INTO public.ctf_challenges (title, description, difficulty, category, reward_bitcoins, hint, solution, flag) VALUES
('Basic SQL Injection', 'Find the admin password in this vulnerable login form', 'easy', 'web', 50, 'Try using OR 1=1', 'admin'' OR 1=1--', 'CTF{sql_injection_basic}'),
('Buffer Overflow', 'Exploit this simple buffer overflow vulnerability', 'medium', 'pwn', 100, 'Check the buffer size', 'Overflow with 256 A characters', 'CTF{buffer_overflow_256}'),
('XSS Challenge', 'Execute JavaScript in this vulnerable search field', 'easy', 'web', 75, 'Try script tags', '<script>alert(1)</script>', 'CTF{xss_basic_alert}'),
('Reverse Engineering', 'Find the hidden flag in this binary', 'hard', 'reverse', 200, 'Use strings command', 'strings binary | grep CTF', 'CTF{hidden_in_binary}'),
('Cryptography', 'Decrypt this Caesar cipher', 'medium', 'crypto', 125, 'ROT13 cipher', 'Apply ROT13 to encoded text', 'CTF{caesar_cipher_decoded}');

-- Insert sample admin user (you should change this)
INSERT INTO public.profiles (id, username, email, is_admin) VALUES
('00000000-0000-0000-0000-000000000000', 'admin', 'admin@ctfmonopoly.com', true);
