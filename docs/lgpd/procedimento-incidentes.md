# Procedimento de Resposta a Incidentes de Segurança — Nuckleo

## 1. Definição

Incidente = acesso não autorizado, vazamento, perda ou alteração indevida de dados pessoais.

---

## 2. Equipe de resposta

| Papel | Responsabilidade |
|-------|------------------|
| **DPO** | Decisão sobre comunicação à ANPD e titulares |
| **Tech lead** | Contenção técnica, logs, correção |
| **Jurídico** | Avaliação de risco e comunicações formais |

---

## 3. Passos (primeiras 72h)

1. **Detectar** — alertas, reporte de usuário, monitoramento.
2. **Conter** — revogar tokens, isolar serviço, bloquear IP.
3. **Avaliar** — quais dados, quantos titulares, gravidade.
4. **Corrigir** — patch, rotação de secrets, restore de backup.
5. **Comunicar** — se risco relevante: ANPD e titulares em prazo razoável (LGPD art. 48).
6. **Documentar** — relatório pós-incidente e lições aprendidas.

---

## 4. Comunicação ao titular (modelo)

> Identificamos um incidente de segurança em [data] que pode ter afetado [dados]. Tomamos as medidas [X]. Recomendamos [alterar senha]. Contato: privacidade@horbyonstudios.com

---

## 5. Registro

Todos os incidentes registrados em planilha interna com: data, descrição, dados afetados, ações, status.
