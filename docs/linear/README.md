# Linear — MortgageCalc

## Orden obligatorio (plan v2.4)

1. **Crear proyecto e issues en Linear** (este directorio + script).
2. Cerrar GATE-0 y GATE-1 en Linear tras PR de docs.
3. **Solo entonces** implementar P0-A en código.

## Creación automática (recomendado)

1. En [Linear → Settings → API](https://linear.app/settings/api), crea una **Personal API key**.
2. En PowerShell, desde la raíz del repo:

```powershell
$env:LINEAR_API_KEY = "lin_api_TU_CLAVE"
node scripts/linear-bootstrap.mjs
```

Vista previa sin API:

```powershell
node scripts/linear-bootstrap.mjs --dry-run
```

## Qué crea el script

| Elemento | Cantidad |
|----------|----------|
| Proyecto | `MortgageCalc` |
| Labels | `gate`, `P0-A`, `P0-B`, `P1`, carriles, `prereq:P0-B` |
| Issues GATE | 3 (GATE-2 en estado completado) |
| Epic P0-A | 1 |
| Issues P0-A | 11 (hijos del epic) |

## Manual (si no usas API)

Copia cada issue desde [GATE-issues.md](./GATE-issues.md) y [P0-A-issues.md](./P0-A-issues.md).

## Después del bootstrap

- Marca `[GATE-0]` y `[GATE-1]` como **Done** cuando el PR `docs/gates-0-1` esté en `main`.
- No muevas issues P0-A a In Progress hasta que ambos gates estén Done.

## Feature nueva (ej. US market listings)

1. Crear epic + sub-issues **antes** de codificar:
   ```powershell
   node scripts/linear-create-market-listings-issue.mjs   # epic AVV-46 si falta
   node scripts/linear-create-market-listings-subs.mjs    # AVV-47–51
   ```
2. Implementar y marcar sub-issues en Linear (`--in-progress` / `--done`).
3. Registrar cambios: `linear-log-change.mjs` + `linear-sync-descriptions.mjs`.

## Bugfixes y cada cambio en código

**Obligatorio** (ver `.cursor/rules/linear-sync.mdc`):

```powershell
node scripts/linear-log-change.mjs AVV-32,AVV-30 "Descripción del fix" b64bd15
node scripts/linear-sync-descriptions.mjs --descriptions-only  # si actualizaste plantillas en el script
```
