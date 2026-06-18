# Comunidades y Sectores (Legacy)

## Comunidades

5 comunidades atendidas por la junta:

1. **Olón** — la única con sectores definidos
2. **Las Núñez**
3. **La Entrada**
4. **Curia**
5. **San José**

## Sectores

- Solo **Olón** tiene sectores definidos
- Para el resto de comunidades NO existen sectores
- Los operadores se dividen por sectores (solo en Olón)
- El sistema actual maneja "sector" pero en realidad es "comunidad" para la mayoría

## Decisión para sistema nuevo

> Usar **comunidad** como unidad geográfica principal.
> Los sectores son opcionales y solo aplican a Olón por ahora.

## Relación en Prisma

```prisma
model Contratos {
  comunidadId    Int          @map("comunidad_id")
  sectorId       Int?         @map("sector_id")  // solo Olón
  comunidad      Comunidades  @relation(...)
  sector         Sectores?    @relation(...)
}
```
