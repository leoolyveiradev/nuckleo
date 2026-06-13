# Registro de Operações de Tratamento (ROPA) — Nuckleo

Documento interno — LGPD art. 37. Atualizar a cada nova finalidade ou subprocessador.

---

## 1. Cadastro e autenticação

| Campo | Detalhe |
|-------|---------|
| **Finalidade** | Criar conta, autenticar, exibir perfil |
| **Dados** | Nome, e-mail, @username, senha (hash), avatar, bio |
| **Titulares** | Usuários cadastrados |
| **Base legal** | Execução de contrato (art. 7º, V) |
| **Retenção** | Vigência da conta + 30 dias |
| **Compartilhamento** | MongoDB (Railway) |
| **Transferência internacional** | Verificar região do cluster Railway |

## 2. Conteúdo do usuário (Espaços e Itens)

| Campo | Detalhe |
|-------|---------|
| **Finalidade** | Armazenar e exibir conhecimento pessoal |
| **Dados** | Títulos, textos, URLs, arquivos, metadados |
| **Base legal** | Execução de contrato |
| **Retenção** | Até exclusão pelo usuário ou da conta |
| **Compartilhamento** | MongoDB; arquivos em storage do provedor |

## 3. Rede social (Amigos e notificações)

| Campo | Detalhe |
|-------|---------|
| **Finalidade** | Conexões entre usuários e alertas |
| **Dados** | E-mails envolvidos, nomes, status de pedidos |
| **Base legal** | Execução de contrato |
| **Retenção** | Enquanto relação existir |

## 4. Agente de IA (Python local)

| Campo | Detalhe |
|-------|---------|
| **Finalidade** | Suporte, personalização de tema, auditoria |
| **Dados** | Texto da mensagem, página atual, tamanho da mensagem, ação retornada |
| **Base legal** | Legítimo interesse / consentimento (banner no chat) |
| **Retenção** | Logs MySQL: 12 meses |
| **Observação** | Não enviar dados sensíveis no chat; aviso visível na UI |

## 5. Logs técnicos

| Campo | Detalhe |
|-------|---------|
| **Finalidade** | Segurança, debugging |
| **Dados** | IP, user-agent, timestamps, endpoints |
| **Base legal** | Legítimo interesse |
| **Retenção** | 90 dias |

---

## Subprocessadores

| Serviço | Função | Dados tratados |
|---------|--------|----------------|
| Railway | Hospedagem Node + MongoDB | Todos os dados da API |
| (MySQL local) | Logs de IA | Metadados de interação |

---

## Encarregado (DPO)

**E-mail:** privacidade@horbyonstudios.com
