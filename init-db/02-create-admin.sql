-- Crear usuario administrador por defecto
-- La contraseña es 'Admin123!' (hash precomputado)
INSERT INTO users (username, password, full_name, email, role, created_at)
VALUES (
  'admin',
  'dd0f40f687f7d57b4d7e0830d84579b7c2d8fb18bc098562b280416e4e0e8823ad7924865d9c6e3a388a44e611655f0f479bde5824dcf4cb0415e11925c637fa.3356ce11992422863ed73b197dc45eee',
  'Administrador del Sistema',
  'admin@example.com',
  'admin',
  NOW()
) ON CONFLICT (username) DO NOTHING;