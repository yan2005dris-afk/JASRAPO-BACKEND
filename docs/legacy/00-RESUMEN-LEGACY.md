# Sistema Legacy — Resumen General

## Contexto

Sistema de gestión de juntas de agua potable desarrollado en **Java + PostgreSQL**, desplegado en servidor Linux (CentOS 7) con acceso local y por internet.

**5 Comunidades**: Olón, Las Núñez, La Entrada, Curia, San José

## Stack Tecnológico

| Componente | Tecnología |
|------------|-----------|
| Backend | Java (JDK) |
| Base de datos | PostgreSQL |
| Servidor | Linux CentOS 7 |
| Programación | Desarrollado en Guayaquil |
| Acceso | Servidor local + salida a internet |
| Proveedor internet | Inter Cable |

## Roles del Sistema

| Rol | Funciones principales |
|-----|----------------------|
| **Secretaria** | Lecturas, facturación, reportes, administración, ingreso de datos |
| **Tesorería** | Cobros, recaudación, transferencias, reportes de pagos |
| **Presidencia** | Refacturación, acceso total (sin cobros) |
| **Operadores/Campo** | Toma de lecturas (antes con tablet, ahora con tableros físicos) |
| **Contabilidad** | Sección nueva, registro duplicado de info de tesorería |
| **Administración** | Gestión de clientes, medidores, cuentas, periodos |

## Módulos del Sistema

| # | Módulo | Carpeta | Estado |
|---|--------|---------|--------|
| 1 | General | `01-general/` | Catálogos base (bancos, agencias, identificaciones) |
| 2 | Administración | `02-administracion/` | Clientes, medidores, cuentas, lectores, cajas, periodos |
| 3 | Lecturas | `03-lecturas/` | Preparar, tomar, registrar, validar |
| 4 | Facturación | `04-facturacion/` | Generación de lotes, otros ingresos |
| 5 | Recaudación | `05-recaudacion/` | Apertura, cobro, cierre de caja, docs electrónicos |
| 6 | Reportes | `06-reportes/` | Facturación, abonos, estado de cuenta, historial |
| 7 | Cortes | `07-cortes/` | Proceso de cortes morosos |
| 8 | Otros Módulos | `08-otros-modulos/` | Contratos, novedades, autorización descuentos |
| 9 | Reuniones | `09-reuniones/` | Notas de reuniones con la junta |

## Problemas Conocidos del Legacy

1. **Anulación de facturas** — no funciona local, método de pago efectivo causa duplicación
2. **Enlace de pago** — funcionaba desde red externa (datos), dejó de funcionar
3. **Transferencias** — clientes no envían comprobante, no se identifica quién pagó
4. **Correo SRI** — envío de facturas por correo no funciona
5. **Contabilidad** — trabajo duplicado entre tesorería y contabilidad
6. **Operadores** — dejaron de usar el sistema por falta de conocimiento tecnológico
7. **Código fuente** — sin acceso, sin contratos, desarrollador remoto con AnyDesk
8. **Error de cortes** — suma +1 automaticamente en meses atrasados

## Intereses del Proyecto Nuevo

- **Pago parcial** — el sistema legacy no lo permite (mínimo $20 para convenios)
- **Interés mora** — cálculo mensual según tasa del gobierno, necesita snapshot
- **Botón de pago** — se intentó con bancos, no se concretó
- **App móvil** — ideal para que clientes paguen desde su celular
- **Comunidad vs Sector** — solo Olón tiene sectores, el resto usa comunidades
