# Política de Segurança da Informação — Nuckleo

Documento interno — Horbyon Studios.

---

## Objetivo

Proteger confidencialidade, integridade e disponibilidade dos dados tratados pelo Nuckleo.

---

## Controles técnicos

- Comunicação criptografada (TLS/HTTPS).
- Autenticação via token JWT com expiração.
- Senhas com hash bcrypt ou argon2 (implementar no backend-node).
- Segredos em variáveis de ambiente — nunca no repositório Git.
- CORS limitado a origens configuradas em `CORS_ORIGIN`.
- Validação de entrada em todos os endpoints REST.
- Upload de arquivos: limite de tamanho, whitelist de MIME types.

---

## Controles organizacionais

- Acesso ao Railway e MongoDB apenas para pessoal autorizado.
- Revisão de dependências (`npm audit`, `pip audit`) mensal.
- Backups automáticos do MongoDB (plugin Railway).
- Desenvolvimento local com `.env` fora do versionamento.

---

## Desenvolvimento seguro

- Code review antes de merge na branch principal.
- Não commitar `.env`, chaves API ou dumps de banco.
- Desativar stack Base44 após migração completa.

---

## Revisão

Anual ou após incidente de segurança.
