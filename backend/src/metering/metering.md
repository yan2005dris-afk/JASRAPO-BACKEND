# 💧 Metering Context

## Responsabilidad
El **Core** del sistema. Se encarga de todo lo relacionado con la medición del consumo de agua y los dispositivos físicos (medidores).

## Contenido
- **`readings/`**: Registro, validación y gestión de lecturas de consumo.
- **`devices/`**: Inventario y estado de los medidores instalados.

## Screaming Architecture
Esta carpeta "grita" que estamos ante un sistema de gestión hídrica. Es el dominio más importante y debe estar protegido de cambios en otros contextos.
