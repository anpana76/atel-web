# Informe para cliente: opciones de hosting para atelsistems.com y atelsistems.es

Fecha: 26/03/2026  
Proyecto: Web corporativa estática (HTML/CSS/JS) con formulario de presupuesto

## 1. Resumen ejecutivo

Para este proyecto, la opción con mejor equilibrio coste/rendimiento es **VPS básico en Europa**.

- Recomendación principal: **VPS (2 vCPU, 2-4 GB RAM)**.
- Recomendación de coste mínimo: **Hosting estático con CDN**.
- Servidor dedicado: **solo recomendable** si se prevé crecimiento alto o necesidades especiales de seguridad/compliance.

## 2. Supuestos del análisis

- Web estática con tráfico corporativo habitual.
- Sin backend pesado ni base de datos de alto consumo.
- Tráfico estimado inicial: 3.000-30.000 visitas/mes.
- Objetivo: disponibilidad estable, HTTPS, baja latencia en España/Europa.

## 3. Comparativa de opciones (coste y rendimiento)

> Rangos aproximados de mercado en Europa. Pueden variar por promoción, IVA, transferencia y backups.

| Opción | Configuración tipo | Coste mensual aprox | Rendimiento esperado | Nivel de gestión | Escalabilidad |
|---|---|---:|---|---|---|
| Hosting estático + CDN | Servicio gestionado (Cloudflare Pages/Netlify/Vercel) | 0-10 EUR | Muy alto para contenido estático global | Muy bajo | Alta (vertical por plan) |
| VPS básico | 1 vCPU, 2 GB RAM, 20-40 GB SSD | 5-10 EUR | Alto para web corporativa y picos moderados | Medio | Alta |
| VPS recomendado | 2 vCPU, 4 GB RAM, 40-80 GB SSD | 8-18 EUR | Muy alto para este caso, margen de crecimiento | Medio | Muy alta |
| VPS alto | 4 vCPU, 8 GB RAM, 80+ GB SSD | 15-35 EUR | Sobrado para este proyecto | Medio | Muy alta |
| Servidor dedicado básico | 4-8 cores físicos, 16-32 GB RAM, NVMe | 60-180+ EUR | Muy alto, pensado para cargas grandes | Medio-Alto | Alta (horizontal o cambio de máquina) |

## 4. Rendimiento práctico esperado para este proyecto

Estimación orientativa para la web actual (estática, optimizada y servida por Nginx):

| Escenario | Capacidad orientativa |
|---|---|
| Hosting estático + CDN | Muy buena respuesta global; ideal para picos y coste mínimo |
| VPS 1 vCPU / 2 GB | Correcto para operación normal (tráfico bajo-medio) |
| VPS 2 vCPU / 4 GB | Recomendado: margen para picos, logs, monitorización y crecimiento |
| Dedicado | Exceso para el estado actual del proyecto |

## 5. Coste anual estimado (sin IVA)

| Opción | Coste anual aprox |
|---|---:|
| Hosting estático + CDN | 0-120 EUR |
| VPS básico | 60-120 EUR |
| VPS recomendado | 96-216 EUR |
| Servidor dedicado | 720-2.160+ EUR |

## 6. Riesgos y consideraciones

- DNS y SSL: imprescindible configurar correctamente para evitar caídas o errores de certificado.
- Mantenimiento: en VPS/dedicado hay que aplicar actualizaciones y controles de seguridad.
- Backups: deben definirse (ficheros + configuración de Nginx + renovaciones SSL verificadas).
- Escalado: empezar pequeño y subir plan cuando haya métricas reales suele ser lo más rentable.

## 7. Recomendación para decisión del cliente

### Opción A (recomendada)

**VPS 2 vCPU / 4 GB RAM (Europa)**

- Coste contenido con gran margen de rendimiento.
- Control completo de dominio, Nginx y HTTPS.
- Preparado para crecimiento sin sobrecoste de dedicado.

### Opción B (mínimo coste)

**Hosting estático + CDN**

- Coste muy bajo y mantenimiento mínimo.
- Excelente velocidad global.
- Menor control de servidor frente a VPS.

### Opción C (solo si hay requisito específico)

**Servidor dedicado**

- Solo justificar si hay exigencias fuertes de seguridad, compliance o carga muy superior a la prevista.

## 8. Plan de implantación recomendado

1. Contratar VPS recomendado (2 vCPU, 4 GB, Ubuntu 22.04).
2. Apuntar DNS (`A` para `@`, `CNAME` para `www`).
3. Desplegar proyecto en `/var/www/atelweb_frontend_only`.
4. Configurar Nginx y activar HTTPS con Certbot.
5. Activar monitorización básica (uptime + espacio disco + renovación SSL).

## 9. Conclusión

Con la carga actual prevista, **VPS recomendado** ofrece el mejor equilibrio entre coste, control y rendimiento.  
El servidor dedicado no aporta retorno claro en esta fase y multiplica el coste anual.
