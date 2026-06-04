# Informe para cliente: viabilidad de alojar la web en un PC local

Fecha: 26/03/2026  
Proyecto: atelsistems.com / atelsistems.es  
Alcance: evaluar si conviene publicar la web desde un PC propio en oficina/local

## 1. Resumen ejecutivo

Sí, técnicamente se puede publicar la web desde un PC local propio, pero para entorno de producción no suele ser la opción más recomendable por disponibilidad, seguridad y riesgo operativo.

Recomendación:
- Producción cliente: VPS en Europa.
- PC local: válido para pruebas, preproducción o contingencia temporal.

## 2. Qué significa servidor en PC local

Consiste en mantener un equipo físico encendido 24/7 en oficina o domicilio, con:
- Sistema operativo y servidor web configurado.
- Router con puertos abiertos a Internet.
- Dominio apuntando a la IP pública de esa conexión.
- Certificado HTTPS y mantenimiento continuo.

## 3. Requisitos mínimos para funcionamiento real

1. Conectividad
- Fibra estable con baja incidencia.
- IP pública real (sin CGNAT).
- Preferible IP fija, o DNS dinámico bien gestionado.

2. Infraestructura
- PC dedicado (no de uso diario).
- SAI/UPS para microcortes eléctricos.
- Disco SSD y copias de seguridad.

3. Seguridad
- Firewall en router y sistema operativo.
- Acceso remoto seguro por clave, sin exponer servicios innecesarios.
- Parches y actualizaciones periódicas.

4. Operación
- Monitorización de disponibilidad.
- Procedimiento de recuperación ante fallo de red/luz/hardware.

## 4. Ventajas

- Coste inicial aparentemente bajo si ya existe el hardware.
- Control total del entorno y de los datos.
- Flexibilidad de configuración interna.

## 5. Riesgos y desventajas clave

- Disponibilidad inferior a datacenter (cortes de luz/internet, reinicios, mantenimiento manual).
- Mayor exposición de seguridad si no hay hardening continuo.
- Dependencia del operador de Internet y del router.
- Riesgo de caídas por cambios de IP si no es fija.
- Mayor carga operativa para el equipo interno.
- Escalado limitado y menos predecible.

## 6. Coste estimado anual (orientativo)

## Opción A: PC local (si ya existe equipo)

- Electricidad 24/7: 100-250 EUR/año (según consumo y tarifa).
- SAI/UPS amortizado: 40-120 EUR/año.
- Tiempo técnico de mantenimiento: 300-1.200 EUR/año (según dedicación).
- Reposición/averías hardware: variable.

Coste total operativo aproximado: 440-1.570 EUR/año (sin contar incidencias graves).

## Opción B: VPS recomendado

- VPS 2 vCPU, 4 GB RAM: 96-216 EUR/año.
- Backups/monitorización básicos: 0-120 EUR/año.

Coste total aproximado: 96-336 EUR/año.

Conclusión económica:
- El PC local no siempre resulta más barato cuando se considera mantenimiento, riesgo y continuidad de servicio.

## 7. Rendimiento esperado

Para una web corporativa estática como este proyecto:
- PC local bien configurado: rendimiento correcto en condiciones normales.
- VPS en datacenter: rendimiento estable y más predecible bajo picos y a lo largo del tiempo.

La diferencia principal no es potencia bruta, sino continuidad, seguridad y gestión operativa.

## 8. Matriz de decisión

| Criterio | PC local | VPS |
|---|---|---|
| Coste directo inicial | Bajo si ya hay PC | Bajo-medio |
| Coste total anual real | Medio-alto | Bajo-medio |
| Disponibilidad | Media-baja | Alta |
| Seguridad operativa | Media (depende del equipo) | Alta (más controlable) |
| Mantenimiento | Alto | Medio-bajo |
| Escalabilidad | Baja-media | Alta |
| Imagen profesional ante cliente | Media | Alta |

## 9. Escenarios donde sí usar PC local

- Demostraciones internas.
- Entorno de pruebas o staging.
- Servicio temporal mientras se migra a VPS.

## 10. Recomendación final para cliente

Para producción pública de atelsistems.com y atelsistems.es:
- Adoptar VPS como solución principal.
- Mantener PC local solo como entorno de pruebas si se desea.

Argumento clave:
- Menor riesgo, mayor estabilidad y coste total más controlado durante todo el año.

## 11. Plan de implantación recomendado (producción)

1. Contratar VPS en Europa.
2. Configurar DNS de dominio.
3. Desplegar web y configurar Nginx.
4. Activar HTTPS con certificado válido.
5. Activar monitorización y copias de seguridad.

---

Documento preparado para soporte de decisión comercial y técnica.
