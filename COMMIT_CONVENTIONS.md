# Convenciones de Commits

## Formato

```
<tipo>(<alcance>): <descripción>
```

## Tipos

| Tipo | Descripción |
|------|-------------|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `refactor` | Refactorización sin cambio de comportamiento |
| `perf` | Mejora de rendimiento |
| `test` | Añadir o corregir tests |
| `docs` | Documentación |
| `chore` | Mantenimiento (deps, configs) |
| `build` | Cambios en build |
| `ci` | Cambios en CI/CD |
| `style` | Formateo de código |

## Idioma

Puedes escribir en **español** o **inglés**. Sé consistente dentro del mismo commit.

## Reglas

### Subject Line

- **Máximo 50 caracteres**
- **Modo imperativo**: "Add" no "Added" ni "Adds"
- **Lowercase** en descripción
- **Sin punto al final**

```bash
# ✅ Español
feat(auth): agregar login con Google
fix(conventions): calcular deuda total correctamente

# ✅ Inglés
feat(auth): add OAuth2 login with Google
fix(conventions): calculate total debt correctly

# ❌ Incorrecto
feat(auth): Agregar login con Google
fix(conventions): Fixed debt calculation.
```

### Body

- Explica el **POR QUÉ**, no el QUÉ
- Máximo 72 caracteres por línea

```bash
# ✅ Español
fix(conventions): calcular deuda con intereses de mora

Anteriormente, los intereses de mora no se incluían en
el cálculo de deuda total. Ahora incluye tanto
saldoActual como interesMora de las prefacturas.

# ✅ Inglés
fix(conventions): calculate total debt correctly

Previously, late interest was not included in the total
debt calculation.
```

### Commits Atómicos

Un cambio lógico por commit:

```bash
# ✅
git add src/auth/ && git commit -m "feat(auth): agregar rate limiting"
git add src/components/ && git commit -m "fix(login): mostrar intentos restantes"

# ❌
git add . && git commit -m "update everything"
```

## Ejemplos

### Español

```bash
feat(conventions): agregar módulo de convenios
fix(conventions): calcular deuda con intereses de mora
refactor(conventions): extraer lógica a use case
docs(api): agregar endpoints de convenios
chore(deps): actualizar versión de prisma
test(conventions): agregar tests unitarios
perf(api): cachear consultas a base de datos
```

### Inglés

```bash
feat(conventions): add payment agreement module
fix(conventions): calculate debt with late interest
refactor(conventions): extract logic to use case
docs(api): add conventions endpoints
chore(deps): update prisma version
test(conventions): add unit tests
perf(api): cache database queries
```

## Herramientas

Con Conventional Commits puedes automatizar:

- **CHANGELOG** automático
- **Semantic Versioning**: feat = minor, fix = patch, BREAKING CHANGE = major
