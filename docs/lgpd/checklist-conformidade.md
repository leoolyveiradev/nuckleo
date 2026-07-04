# Checklist de Conformidade LGPD — Nuckleo

Documento interno para acompanhamento da adequação. Marque ✅ quando implementado.

---

## Governança

- [ ] Nomear Encarregado (DPO) — privacidade@nuckleo.com.br
- [ ] Publicar Política de Privacidade no site (`frontend/pages/legal/`)
- [ ] Publicar Termos de Uso e Política de Cookies
- [ ] Registro de operações de tratamento (ROPA) atualizado
- [ ] Contratos com subprocessadores (Railway, etc.)

## Coleta e consentimento

- [ ] Banner de cookies com opt-in para não essenciais
- [ ] Checkbox de aceite dos Termos no cadastro
- [ ] Registro de data/hora/IP do consentimento no MongoDB
- [ ] Base legal documentada por finalidade (ver ROPA)

## Direitos do titular

- [ ] Formulário ou e-mail para solicitações (acesso, exclusão, portabilidade)
- [ ] Fluxo interno de resposta em até 15 dias
- [ ] Endpoint ou processo de exportação de dados (portabilidade JSON)
- [ ] Endpoint de exclusão de conta (direito ao esquecimento)

## Segurança

- [ ] HTTPS em produção (Railway)
- [ ] Variáveis sensíveis apenas em `.env` / secrets do Railway
- [ ] CORS restrito a domínios conhecidos
- [ ] Backups MongoDB configurados
- [ ] Política de senhas / JWT com expiração
- [ ] Logs sem dados pessoais desnecessários

## Incidentes

- [ ] Procedimento de resposta a incidentes documentado
- [ ] Template de comunicação à ANPD e titulares
- [ ] Simulação anual de incidente

## Menores e dados sensíveis

- [ ] Bloqueio de cadastro < 13 anos (declaração no cadastro)
- [ ] Não solicitar dados sensíveis no formulário padrão

## Migração Base44 → stack própria

- [ ] Mapear dados exportados da Base44
- [ ] Atualizar ROPA com novos subprocessadores
- [ ] Revisar Política de Privacidade após go-live
- [ ] DPIA se houver tratamento em larga escala de dados de IA

---

**Revisão:** trimestral ou a cada mudança relevante na arquitetura.
