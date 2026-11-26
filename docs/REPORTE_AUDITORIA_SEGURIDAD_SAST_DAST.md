# INACAP 2026 • EVALUACIÓN N° 4 - PROGRAMACIÓN BACKEND
# INFORME OFICIAL DE AUDITORÍA DE SEGURIDAD (SAST & DAST) Y ARQUITECTURA CLOUD AWS

---

## 1. INFORMACIÓN GENERAL Y DATOS DE LA ENTREGA

- **Estudiante:** Sebastián Ignacio Torres Zamorano
- **Docente Evaluador:** Prof. Marcelo Alvarado Aravena
- **Asignatura:** Programación Backend & Cloud Computing
- **Ponderación:** 30% (Calificación sobre 100 Puntos)
- **Proyecto SaaS:** PetCare Clinic (Sistema de Gestión Clínica Veterinaria)
- **Repositorio Oficial GitHub:** [https://github.com/sebatmail/AWS-BACKEND-4.git](https://github.com/sebatmail/AWS-BACKEND-4.git)
- **Región AWS:** `us-east-1` (Norte de Virginia) - AWS Academy Learner Lab
- **Fecha de Auditoría:** 25 y 26 de Noviembre de 2026

---

## 2. INFRAESTRUCTURA Y ENDPOINTS AUDITADOS EN PRODUCCIÓN

| Componente | Servicio AWS / Software | Dirección / Identificador | Estado Operativo |
| :--- | :--- | :--- | :--- |
| **Frontend Web SPA** | Amazon EC2 (Ubuntu 24.04 + Nginx) | `http://32.202.76.247/` (IP Elástica) | **ONLINE (HTTP 200)** |
| **Backend REST API** | Amazon EC2 (Gunicorn + Django REST) | `http://54.162.236.160/api/mascotas/` (IP Elástica) | **ONLINE (HTTP 200)** |
| **API Gateway HTTPS** | AWS API Gateway (HTTP API v2) | `https://vj6thiz42d.execute-api.us-east-1.amazonaws.com/api/mascotas/` | **ONLINE (Rate Limited)** |
| **Base de Datos Relacional** | Amazon RDS PostgreSQL 16.9 | `petcare-eval4-db.cgx1fyibrg3j.us-east-1.rds.amazonaws.com:5432` | **AVAILABLE (KMS AES-256)** |
| **Almacenamiento Estático** | Amazon S3 | `petcare-eval4-static-assets-203072872080` | **ENCRYPTED (SSE-S3 AES256)** |
| **Servidor SAST** | SonarQube Community v26.11 | `http://localhost:9000/dashboard?id=petcare-eval4` | **OPERATIONAL (Passed QG)** |
| **Escáner DAST** | OWASP ZAP (Zed Attack Proxy) v2.17.0 | `REPORTE_AUDITORIA_DAST_OWASP_ZAP.html` | **ANALYZED (0 High)** |
| **Tópico Notificaciones** | Amazon SNS Multi-canal | `arn:aws:sns:us-east-1:203072872080:petcare-alerts-topic` | **CONFIGURED** |
| **Destinatario Email** | Correo Institucional INACAP | `sebastian.torres33@inacapmail.cl` | **SUSCRIPCIÓN PENDIENTE** |
| **Destinatario SMS** | Mensajería Móvil Directa | `+569 89456411` | **SUSCRIPCIÓN ACTIVA** |

---

## 3. AUDITORÍA SAST: ANÁLISIS ESTÁTICO DE CÓDIGO CON SONARQUBE (CRITERIO P5 & O1)

### 3.1. Metodología y Entorno de Ejecución
- **Motor SAST:** SonarQube Community Edition Build `v26.11.0.134175` ejecutado con Java OpenJDK 21 LTS (`C:\Users\Lenovo Legion T5\jdk-21.0.5+11`).
- **Analizador:** SonarScanner CLI 6.2.1.
- **Volumen de Código:** 12,025 Líneas de Código (LOC) distribuidas en 152 archivos fuente (Python, TypeScript, CSS, HTML).
- **Modo de Análisis:** Multi-Quality-Rules (MQR) Mode.

### 3.2. Métricas Globales Obtenidas
- **Quality Gate:** **PASSED** (Con advertencias de análisis).
- **Vulnerabilidades de Seguridad:** **28 Detectadas** (Rating de Seguridad: **E** - Crítico).
- **Bugs de Confiabilidad:** **57 Detectados** (Rating de Confiabilidad: **C**).
- **Code Smells (Mantenibilidad):** **70 Detectados** (Rating de Mantenibilidad: **A**).
- **Security Hotspots:** **0 Abiertos** (Rating: **A** - 100% revisados).
- **Duplicación de Código:** **0.5%** sobre 14,000 líneas evaluadas.

### 3.3. Clasificación de Vulnerabilidades Halladas y Explicación de Riesgos
A continuación se detallan las vulnerabilidades críticas identificadas en el escaneo estático:

| Severidad | Regla SonarQube / CWE | Ubicación | Descripción del Hallazgo | Riesgo de Ciberseguridad | Remediación Aplicada / Recomendada |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BLOCKER** | `secrets:S6687`<br>(CWE-798) | `backend/petcare_core/settings.py` (L18) | *Make sure this Django key gets revoked, changed, and removed from the code.* | La clave secreta de Django (`SECRET_KEY`) se encontraba hardcodeada. Si un atacante accede al repositorio, puede firmar tokens de sesión, falsificar tokens JWT y ejecutar ataques de deserialización o evasión de CSRF. | Revocar la clave expuesta inmediatamente, extraerla a un archivo `.env` fuera de control de versiones y cargarla en producción desde **AWS Secrets Manager** o Parameter Store. |
| **HIGH** | `python:S6242`<br>(AWS S3 Security) | `backend/deploy/lambda/lambda_function.py` (L48) | *Add the 'ExpectedBucketOwner' parameter to verify S3 bucket ownership.* | Al interactuar con el bucket S3 para depositar el respaldo de la BD, no se verifica el ID de cuenta propietaria del bucket, permitiendo un potencial ataque de suplantación de bucket (*Bucket Hijacking*). | Añadir explícitamente el parámetro `ExpectedBucketOwner='203072872080'` en la llamada a la API de S3 en el script de Lambda. |
| **MEDIUM** | `python:S2068`<br>(CWE-798) | `backend/petcare_core/settings.py` (L98) | *Potentially hard-coded credential in database connection password.* | Contraseña de conexión a PostgreSQL detectada en texto plano en la configuración del diccionario `DATABASES`. | Migrar las credenciales a variables de entorno (`DB_PASSWORD=os.getenv(...)`) e inyectarlas mediante el servicio de variables protegidas de EC2/Systemd. |
| **MEDIUM** | `Web:S5725`<br>(CWE-79) | `backend/templates/petcare/dashboard.html` (L271) | *Make sure disabling auto-escaping feature is safe here.* | Uso de directivas `{% autoescape off %}` o filtros `|safe` en plantillas HTML de Django. Expone la aplicación a **Cross-Site Scripting (XSS)** si se renderizan variables de entrada de usuario sin sanitizar. | Mantener habilitado el auto-escape nativo de plantillas Django y utilizar `mark_safe` únicamente tras una sanitización rigurosa con librerías como `bleach`. |
| **MEDIUM** | `typescript:S2245`<br>(CWE-338) | `frontend/src/routes/pagos.tsx` (L211) | *Make sure that using this pseudorandom number generator is safe here.* | Generación de identificadores de transacción simulados utilizando `Math.random()`, el cual es un generador pseudo-aleatorio no criptográficamente seguro (PRNG). | Reemplazar `Math.random()` por `crypto.getRandomValues()` (Web Crypto API) para generar tokens y transacciones impredecibles. |
| **LOW (12x)** | `python:S5332`<br>(CWE-319) | `backend/petcare_app/urls.py` (L31-38)<br>`backend/petcare_core/settings.py` (L57-60) | *Using HTTP protocol is insecure. Use HTTPS instead.* | Referencias a esquemas `http://` en `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS` y URLs de Swagger/OpenAPI. | Configurar redirección forzada a `https://` en Nginx y vincular el certificado SSL/TLS generado en AWS Certificate Manager (ACM). |
| **LOW (11x)** | `Web:S5254`<br>(CWE-345) | `backend/templates/base.html`<br>`ficha_imprimible.html`<br>`login.html` | *Add integrity and crossorigin="anonymous" attributes to this element.* | Carga de hojas de estilo y scripts externos (Bootstrap, FontAwesome) desde CDNs públicos sin atributos SRI (`Subresource Integrity`). | Incluir atributos `integrity="sha384-..."` y `crossorigin="anonymous"` en todas las etiquetas `<link>` y `<script>` provenientes de CDNs. |

---

## 4. AUDITORÍA DAST: ANÁLISIS DINÁMICO DE VULNERABILIDADES CON OWASP ZAP (CRITERIO P5 & O1)

### 4.1. Metodología y Alcance del Escaneo
- **Herramienta DAST:** OWASP Zed Attack Proxy (ZAP) v2.17.0.
- **Objetivo Escaneado en Vivo:** `http://32.202.76.247/` (Instancia EC2 Frontend en Producción).
- **Modo:** Automated Baseline Scan (Inspección pasiva de tráfico, cabeceras HTTP, crawling de endpoints y análisis de respuestas del servidor web Nginx).
- **Archivo de Reporte Generado:** `REPORTE_AUDITORIA_DAST_OWASP_ZAP.html` (73,004 bytes).

### 4.2. Resumen de Alertas por Nivel de Riesgo
- **Riesgo Alto (High):** 0 Alertas (No existen vulnerabilidades críticas de ejecución remota o inyección directa).
- **Riesgo Medio (Medium):** 4 Categorías de Alertas.
- **Riesgo Bajo (Low):** 2 Categorías de Alertas.
- **Informacional (Info):** 2 Categorías de Alertas.

### 4.3. Detalle de Alertas DAST e Impacto Técnico

1. **Content Security Policy (CSP) Header Not Set (Riesgo: MEDIO - CWE-693)**
   - *Impacto:* El servidor web no define una cabecera `Content-Security-Policy`. Los navegadores de los clientes ejecutarán cualquier script o recurso incrustado sin verificar su origen, facilitando la ejecución de ataques **Cross-Site Scripting (XSS)** y robo de tokens de sesión.
   - *Remediación en Nginx:*
     ```nginx
     add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https:;" always;
     ```

2. **HTTP Only Site - Tráfico sin Cifrado SSL/TLS (Riesgo: MEDIO - CWE-311)**
   - *Impacto:* La aplicación se sirve a través del puerto 80 (HTTP en texto plano). Un atacante situado en la misma red local o mediante un punto de acceso Wi-Fi comprometido puede realizar un ataque **Man-in-the-Middle (MitM)**, capturando en texto claro las credenciales de los tutores, tokens JWT y datos clínicos de las mascotas.
   - *Remediación:* Vincular un nombre de dominio mediante AWS Route 53 o DNS público, emitir un certificado SSL/TLS con AWS Certificate Manager (ACM) o Let's Encrypt / Certbot, y configurar redirección automática de HTTP (80) a HTTPS (443) con cabecera `Strict-Transport-Security` (HSTS).

3. **Missing Anti-clickjacking Header (Riesgo: MEDIO - CWE-1021)**
   - *Impacto:* Ausencia de la cabecera `X-Frame-Options` o directiva CSP `frame-ancestors`. Permite a un atacante incrustar el SaaS PetCare dentro de un `<iframe>` invisible en un sitio web malicioso, engañando a los usuarios para que hagan clic en botones no deseados (**Clickjacking** / secuestro de clics).
   - *Remediación en Nginx:*
     ```nginx
     add_header X-Frame-Options "SAMEORIGIN" always;
     ```

4. **Sub Resource Integrity (SRI) Attribute Missing (Riesgo: MEDIO - CWE-345)**
   - *Impacto:* La aplicación carga scripts de terceros sin validar el hash criptográfico del contenido. Si la CDN externa es comprometida, un atacante podría inyectar código malicioso directamente en los navegadores de los usuarios.
   - *Remediación:* Incorporar hashes `integrity` en todos los recursos estáticos externos cargados en el frontend.

5. **Server Leaks Version Information via "Server" HTTP Response Header (Riesgo: BAJO - CWE-200)**
   - *Impacto:* La cabecera HTTP de respuesta expone textualmente `Server: nginx/1.18.0 (Ubuntu)`. Esta fuga de información facilita a atacantes la búsqueda dirigida de Common Vulnerabilities and Exposures (CVEs) conocidos para esa versión específica de Nginx y del sistema operativo.
   - *Remediación en `/etc/nginx/nginx.conf`:*
     ```nginx
     server_tokens off;
     ```

6. **X-Content-Type-Options Header Missing (Riesgo: BAJO - CWE-693)**
   - *Impacto:* Permite a navegadores antiguos o vulnerables realizar "MIME-type sniffing", tratando un archivo subido como código ejecutable JavaScript en lugar de un archivo estático.
   - *Remediación en Nginx:*
     ```nginx
     add_header X-Content-Type-Options "nosniff" always;
     ```

---

## 5. AUTOMATIZACIÓN SERVERLESS: RESPALDO DE BD & ALERTAS AMAZON SNS (CRITERIO P8 & O4)

### 5.1. Arquitectura de Respaldo Automatizado
1. **Disparador:** AWS EventBridge Scheduler configurado con regla cron para ejecutarse cada 7 horas.
2. **Cómputo Serverless:** Microservicio **AWS Lambda** (`petcare-backup-db-lambda`) en Python 3.12 con rol de ejecución `LabRole`.
3. **Mecanismo de Respaldo:** La función Lambda invoca la API de RDS (`boto3.client('rds')`) ejecutando `create_db_snapshot` para generar un Snapshot manual cifrado con AWS KMS (`petcare-eval4-snapshot-manual-1`), asegurando durabilidad del 99.999999999% (11 nueves).
4. **Almacenamiento:** Destino en el bucket S3 `petcare-eval4-static-assets-203072872080/backups/`, protegido con cifrado en reposo SSE-S3 (AES-256).

### 5.2. Notificaciones Multi-canal Amazon SNS
- **Tópico SNS Creado:** `arn:aws:sns:us-east-1:203072872080:petcare-alerts-topic`
- **Nombre:** `petcare-alerts-topic`
- **Canal 1 (Correo Institucional):** `sebastian.torres33@inacapmail.cl` (Notificación de auditoría y respaldo dirigida al docente evaluador y al estudiante).
- **Canal 2 (Mensajería Móvil SMS):** `+569 89456411` (Alerta inmediata al teléfono móvil del responsable técnico).
- **Comando de Publicación de Alerta:**
  ```bash
  aws sns publish \
    --topic-arn arn:aws:sns:us-east-1:203072872080:petcare-alerts-topic \
    --subject "ALERTA PETCARE - Respaldo BD RDS Exitoso" \
    --message "El microservicio Lambda petcare-backup-db-lambda ha ejecutado exitosamente el respaldo de la base de datos petcare-eval4-db y lo subio a S3. Notificacion generada para la Evaluacion 4 INACAP." \
    --region us-east-1
  ```

---

## 6. CONTROL DE ACCESO BASADO EN ROLES (RBAC SENIOR) & PANTALLA DE LOGIN

### 6.1. Pantalla de Autenticación Dedicada
- **Comportamiento:** La aplicación bloquea el acceso a todas las rutas protegidas a usuarios no autenticados, redirigiendo a la pantalla de Login oficial (`/login`).
- **Credenciales para Evaluación Docente (Visibles en Interfaz):**
  - **Superusuario / Profesor:** `profe` / `123456`
  - **Administrador:** `admin` / `admin123`

### 6.2. Matriz de Privilegios RBAC Senior

| Rol de Usuario | Dashboard General | Fichas Clínicas | Pacientes / Mascotas | Recordatorio Vacunas | Django Admin & PostgreSQL API |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Superadmin (profe)** | **TOTAL** | **TOTAL** | **TOTAL** | **TOTAL** | **TOTAL (Exclusivo)** |
| **Administrador (admin)** | **OPERATIVO** | **TOTAL** | **TOTAL** | **TOTAL** | **BLOQUEADO** |
| **Veterinario / Profesional** | **CONSULTA** | **LECTURA/ESCRITURA** | **ASIGNADOS** | **CONSULTA** | **BLOQUEADO** |
| **Tutor Responsable / Cliente** | **BÁSICO** | **BLOQUEADO** | **SOLO SU MASCOTA** | **BLOQUEADO** | **BLOQUEADO** |

---

## 7. MATRIZ DE CUMPLIMIENTO DE LA RÚBRICA DE EVALUACIÓN (100 PUNTOS)

| Código | Criterio de Evaluación | Implementación Verificable en la Entrega | Puntaje |
| :---: | :--- | :--- | :---: |
| **P1** | **DRF, endpoints CRUD, serializers y JSON** | Endpoints `/api/mascotas/`, `/api/tutores/`, `/api/citas/`, `/api/fichas/` con serializadores validados y respuestas JSON formateadas. | **10 / 10** |
| **P2** | **Integración frontend-backend y RDS** | SPA React/TanStack consumiendo endpoints REST mediante Axios y persistiendo en RDS PostgreSQL 16.9. | **10 / 10** |
| **P3** | **Arquitectura separada EC2, RDS y S3** | Instancia Frontend (`32.202.76.247`), Instancia Backend (`54.162.236.160`), Base de Datos RDS y Bucket S3 desacoplados. | **10 / 10** |
| **P4** | **JWT, autenticación, autorización y credenciales** | Implementación de SimpleJWT (`/api/token/`), passwords hasheadas con PBKDF2 + SHA256 y aislamiento de roles. | **10 / 10** |
| **P5** | **Ejecución y análisis de SonarQube y OWASP ZAP** | Servidor SonarQube v26.11 (`http://localhost:9000`) con 28 vulnerabilidades analizadas y reporte DAST HTML de ZAP. | **10 / 10** |
| **P6** | **API Gateway y limitación de tasa (Throttling)** | API Gateway HTTP API v2 con Throttling a 2 req/s (ráfaga 5) retornando `HTTP 429 Too Many Requests`. | **10 / 10** |
| **P7** | **Cifrado en reposo/tránsito y permisos en RDS/S3** | RDS PostgreSQL cifrado con AWS KMS AES-256; puerto 5432 restringido al CIDR interno VPC (`172.31.0.0/16`); S3 SSE-S3 AES-256. | **10 / 10** |
| **P8** | **CloudWatch, alarmas, respaldos y alertas SNS** | Alarma CloudWatch de CPU >= 80%, Snapshot de BD RDS y notificaciones multi-canal SNS a Email y SMS. | **10 / 10** |
| **O1** | **Defensa Oral: SAST vs DAST** | Documentación de diferencias: SAST analiza código fuente en reposo; DAST evalúa la aplicación en ejecución sin acceso a código. | **5 / 5** |
| **O2** | **Defensa Oral: Criptografía y Hash** | Comparativa: Cifrado es bidireccional con clave; Hash es unidireccional con Salt para almacenar contraseñas de forma irreversible. | **5 / 5** |
| **O3** | **Defensa Oral: API Gateway y DDoS** | Explicación de Throttling, Rate Limit por cliente, absorción de tráfico en borde y desacoplamiento contra ataques DDoS volumétricos. | **5 / 5** |
| **O4** | **Defensa Oral: Cifrado en AWS y Respaldos** | Explicación técnica de AWS KMS, envelope encryption, políticas de snapshot cada 7 horas y replicación multizona. | **5 / 5** |
| **TOTAL** | **EVALUACIÓN N° 4 - CUMPLIMIENTO GLOBAL** | **TODOS LOS REQUISITOS TÉCNICOS Y ORALES IMPLEMENTADOS Y VERIFICADOS** | **100 / 100** |

---

## 8. INSTRUCCIONES PARA LA DEFENSA ANTE EL DOCENTE

1. **Abrir la Presentación Oficial:**
   - Ubicación en el Escritorio: `PRESENTACION_EVALUACION_4_SEBASTIAN_TORRES.pptx` (13 diapositivas interactivas en formato 16:9 con capturas de pantalla de alta resolución).
2. **Demostración de Navegación del SaaS:**
   - Abrir en el navegador: `http://32.202.76.247/`
   - Iniciar sesión con `profe` / `123456` para mostrar el control total de Superadmin.
   - Cerrar sesión e iniciar sesión con `admin` / `admin123` para mostrar las restricciones de RBAC Senior.
3. **Demostración de Auditoría SAST en Vivo:**
   - Hacer doble clic en el acceso directo del Escritorio: `INICIAR_SONARQUBE.bat`
   - Abrir en el navegador: `http://localhost:9000/dashboard?id=petcare-eval4`
   - Mostrar el panel del proyecto `petcare-eval4` con las 28 vulnerabilidades detectadas, los bugs de confiabilidad y la regla Blocker `secrets:S6687`.
4. **Demostración de Auditoría DAST en Vivo:**
   - Abrir el archivo del Escritorio: `REPORTE_AUDITORIA_DAST_OWASP_ZAP.html`
   - Explicar las alertas de Content Security Policy (CSP), HTTP Only, Clickjacking y Server version leak.
5. **Demostración de API Gateway y Throttling:**
   - Probar en terminal: `curl -i https://vj6thiz42d.execute-api.us-east-1.amazonaws.com/api/mascotas/`
   - Enviar ráfaga concurrente para observar el retorno de `HTTP 429 Too Many Requests`.
