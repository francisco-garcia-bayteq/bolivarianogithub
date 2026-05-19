# 9. Implementar servicios backend para agregación de productos

**Prioridad**: Alta

**Historia padre**: #29224

## Descripción
Crear capa de servicio (ConsolidatedPositionService) que consulte fuentes internas/externas por tipo de producto (AccountsService, CardsService, InvestmentsService, LoansService) y agregue resultados. Manejar timeouts, fallos parciales (degradación controlada) y ordenamiento consistente por tipo.
