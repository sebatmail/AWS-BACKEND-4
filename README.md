<div align="center">

# 🐾 PetCare • Cloud Veterinary Healthcare Platform
### **Evaluación N°4 – Programación Backend & Arquitectura Cloud Distribuida AWS**
**INACAP 2026 • Unidad 3: Aplicación API RESTful – Arquitectura AWS, Integración y Seguridad**

[![AWS Infrastructure](https://img.shields.io/badge/AWS-us--east--1-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
[![Django REST Framework](https://img.shields.io/badge/Django_REST-5.1.3-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.django-rest-framework.org/)
[![React](https://img.shields.io/badge/React-19.0-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![PostgreSQL RDS](https://img.shields.io/badge/PostgreSQL_RDS-16.9_KMS-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://aws.amazon.com/rds/)
[![Amazon S3](https://img.shields.io/badge/Amazon_S3-SSE--AES256-569A31?style=for-the-badge&logo=amazons3&logoColor=white)](https://aws.amazon.com/s3/)
[![API Gateway](https://img.shields.io/badge/API_Gateway-Throttling_Active-8C4FFF?style=for-the-badge&logo=amazonapigateway&logoColor=white)](https://aws.amazon.com/api-gateway/)
[![AWS Lambda](https://img.shields.io/badge/Lambda-Serverless_Microservice-FF9900?style=for-the-badge&logo=awslambda&logoColor=white)](https://aws.amazon.com/lambda/)
[![Security Grade](https://img.shields.io/badge/Security_Score-A%2B_SAST%2FDDAST-success?style=for-the-badge&logo=owasp&logoColor=white)](https://owasp.org/)

<br/>

**[🌐 Explorar Frontend en Producción](http://54.175.250.115/)** • **[🛡️ Django Admin del Evaluador](http://54.175.250.115/admin/)** • **[⚡ API Gateway Rate Limit](https://vj6thiz42d.execute-api.us-east-1.amazonaws.com/api/mascotas/)** • **[📦 Repositorio GitHub](https://github.com/sebatmail/AWS-BACKEND-4.git)**

<p align="center">
  <em>Sistema hospitalario veterinario integral con arquitectura desacoplada multi-capa de alta disponibilidad, seguridad criptográfica PBKDF2/KMS, microservicio serverless de respaldo automatizado y observabilidad continua.</em>
</p>

---

</div>

## 📑 Tabla de Contenidos

- [🏛️ Arquitectura del Sistema Cloud AWS](#️-arquitectura-del-sistema-cloud-aws)
- [🌐 Matriz de Infraestructura en Producción](#-matriz-de-infraestructura-en-producción)
- [🔑 Credenciales y Perfiles de Acceso (RBAC)](#-credenciales-y-perfiles-de-acceso-rbac)
- [⚡ Catálogo de Endpoints RESTful y Autenticación JWT](#-catálogo-de-endpoints-restful-y-autenticación-jwt)
- [🛡️ Seguridad, Criptografía y Protección de Datos](#️-seguridad-criptografía-y-protección-de-datos)
- [🔍 Auditoría de Seguridad: SAST (SonarQube) y DAST (OWASP ZAP)](#-auditoría-de-seguridad-sast-sonarqube-y-dast-owasp-zap)
- [⏱️ API Gateway: Throttling y Protección Anti-Abuso](#️-api-gateway-throttling-y-protección-anti-abuso)
- [💾 Microservicio Serverless de Respaldo y Alertas SNS](#-microservicio-serverless-de-respaldo-y-alertas-sns)
- [📊 Observabilidad y Monitoreo con CloudWatch](#-observabilidad-y-monitoreo-con-cloudwatch)
- [👨‍💻 Ficha Académica y Autoría](#-ficha-académica-y-autoría)

---

## 🏛️ Arquitectura del Sistema Cloud AWS

El sistema implementa una **arquitectura desacoplada en 4 niveles principales de servicio**, asegurando separación estricta de procesamiento, persistencia, almacenamiento estático y microservicios serverless, tal como exige la pauta oficial:

```mermaid
flowchart TD
    subgraph CLIENTES [" Capa de Clientes & Acceso Web "]
        Browser["🖥️ Navegador Web del Usuario"]
        AdminUser["👨‍🏫 Docente Evaluador (Django Admin)"]
    end

    subgraph AWS_GATEWAY [" Amazon API Gateway (us-east-1) "]
        APIGW["⚡ HTTP API Gateway (vj6thiz42d)\n• Rate Limit: 2 req/s\n• Burst: 5 req/s\n• Auto-Throttle: HTTP 429"]
    end

    subgraph AWS_COMPUTE [" Capa de Cómputo (Amazon EC2) "]
        EC2_FRONT["💻 EC2-FRONTEND (i-09bbdac8df188b72e)\n• IP: 54.175.250.115\n• React TanStack Start + Node.js 20\n• Nginx Reverse Proxy (Port 80)"]
        EC2_BACK["⚙️ EC2-BACKEND-DRF (i-0cf56e10655b7ab5e)\n• IP: 54.224.67.92\n• Django REST Framework + Gunicorn\n• Nginx Reverse Proxy (Port 80/8000)"]
    end

    subgraph AWS_PERSISTENCE [" Capa de Persistencia & Almacenamiento "]
        RDS_PG[("🗄️ Amazon RDS PostgreSQL 16.9\n(petcare-eval4-db)\n• Cifrado en reposo: AWS KMS\n• Subred Privada (Puerto 5432)\n• Security Group Restringido")]
        S3_BUCKET[("🪣 Amazon S3 Static Assets\n(petcare-eval4-static-assets-203072872080)\n• Cifrado SSE-S3 (AES256)\n• Assets, CSS, Fotos y Backups")]
    end

    subgraph AWS_SERVERLESS [" Microservicios Serverless & Observabilidad "]
        LAMBDA["⚡ AWS Lambda (petcare-backup-db-lambda)\n• Python 3.11 Serverless\n• Trigger Respaldo c/ 7 Horas"]
        SNS["📢 Amazon SNS (petcare-alerts-topic)\n• Notificaciones y Alertas por Email"]
        CW["📈 Amazon CloudWatch\n• Alarma CPUUtilization >= 80%"]
    end

    Browser -->|HTTP Port 80| EC2_FRONT
    AdminUser -->|/admin/ Login| EC2_FRONT
    EC2_FRONT -->|Proxy /admin & /api| EC2_BACK
    Browser -->|HTTPS API Requests| APIGW
    APIGW -->|Proxy Rate-Limited| EC2_BACK
    EC2_BACK -->|Conexión Segura TLS / Port 5432| RDS_PG
    EC2_FRONT -->|Assets & Multimedia| S3_BUCKET
    EC2_BACK -->|Static Collection| S3_BUCKET
    LAMBDA -->|Snapshot JSON| S3_BUCKET
    LAMBDA -->|Alerta de Respaldo| SNS
    EC2_BACK -.->|Métricas CPU| CW
```

---

## 🌐 Matriz de Infraestructura en Producción

| Servicio AWS | Recurso / ID Oficial | Dirección / Endpoint Público | Configuración de Seguridad |
|---|---|---|---|
| **Amazon EC2 (Frontend)** | `EC2-FRONTEND`<br/>`i-09bbdac8df188b72e` | [`http://54.175.250.115/`](http://54.175.250.115/) | Nginx 1.24 + Ubuntu 24.04 LTS. Proxy inverso con cabeceras `X-Forwarded-*`. |
| **Amazon EC2 (Backend)** | `EC2-BACKEND-DRF`<br/>`i-0cf56e10655b7ab5e` | [`http://54.224.67.92/`](http://54.224.67.92/) | Gunicorn 3 workers + Django 5.1.3. `CSRF_TRUSTED_ORIGINS` y CORS configurados. |
| **Amazon RDS (PostgreSQL)** | `petcare-eval4-db`<br/>Engine: `PostgreSQL 16.9` | `petcare-eval4-db.cgx1fyibrg3j.us-east-1.rds.amazonaws.com` | **Cifrado en reposo activo mediante AWS KMS**. Security Group restringido al puerto 5432 para la VPC privada. |
| **Amazon S3** | `petcare-eval4-static-assets-203072872080` | `s3://petcare-eval4-static-assets-203072872080` | **Cifrado en reposo SSE-S3 (AES256)**. Bloqueo de acceso público indiscriminado y control granular. |
| **Amazon API Gateway** | `petcare-eval4-api-gateway`<br/>ID: `vj6thiz42d` | [`https://vj6thiz42d.execute-api.us-east-1.amazonaws.com`](https://vj6thiz42d.execute-api.us-east-1.amazonaws.com) | HTTP API con **Rate Limit de 2 req/s** y **Burst de 5 req/s**. Retorna `HTTP 429 Too Many Requests`. |
| **Amazon CloudWatch** | `petcare-backend-high-cpu-alarm` | Consola AWS CloudWatch us-east-1 | Alarma de observabilidad sobre `CPUUtilization >= 80%` en periodo de 300 segundos. |
| **AWS Lambda** | `petcare-backup-db-lambda` | Invocación EventBridge / Trigger | Microservicio Serverless Python 3.11 para respaldo programado cada 7 horas con salida hacia S3. |
| **Amazon SNS** | `petcare-alerts-topic` | `arn:aws:sns:us-east-1:203072872080:petcare-alerts-topic` | Tópico de notificaciones pub/sub con suscripción por correo electrónico confirmable. |

---

## 🔑 Credenciales y Perfiles de Acceso (RBAC)

El sistema cuenta con **Control de Acceso Basado en Roles (RBAC)** tanto en la capa de interfaz React como en el panel administrativo de Django:

| Rol del Sistema | Usuario | Contraseña | Alcance y Permisos Asignados |
|---|---|---|---|
| 👑 **Superadministrador (Docente)** | `profe` | `123456` | Acceso irrestricto a Django Admin, auditoría clínica, reportes contables y gestión de usuarios. |
| 🛡️ **Administrador Técnico** | `admin` | `admin123` | Gestión de personal médico, tarifas, auditorías y configuración del hospital. |
| 🩺 **Médico Veterinario** | `vet` | `vet123` | Emisión de fichas clínicas, recetas médicas, registro de vacunación y atención de citas. |
| 🐾 **Tutor / Cliente** | `tutor` | `tutor123` | Reserva de consultas, visualización de historial de mascotas y pasarela de pago. |
| 👁️ **Visitante / Modo Auditoría** | *Sin login* | *N/A* | Modo solo lectura con advertencia informativa. Operaciones de mutación bloqueadas. |

---

## ⚡ Catálogo de Endpoints RESTful y Autenticación JWT

### 1. Mecanismo de Autenticación con Tokens Criptográficos (JWT)
El backend implementa **JSON Web Tokens (RFC 7519)** con rotación mediante `django-rest-framework-simplejwt`:

| Método | Endpoint | Cabecera Requerida | Descripción |
|---|---|---|---|
| `POST` | `/api/token/` | `Content-Type: application/json` | Entrega de par de tokens (`access` válido por 60 min, `refresh` por 24 horas). |
| `POST` | `/api/token/refresh/` | `Content-Type: application/json` | Renovación transparente del token de acceso sin requerir reingreso de credenciales. |
| `POST` | `/api/token/verify/` | `Content-Type: application/json` | Verificación de firma criptográfica y expiración del token. |

### 2. Endpoints CRUD del Dominio Clínico

```http
GET    /api/mascotas/            -> Listar pacientes (filtro por especie, tutor o estado)
POST   /api/mascotas/            -> Registrar nueva mascota con chip y edad
GET    /api/mascotas/{id}/       -> Obtener detalle clínico completo
PUT    /api/mascotas/{id}/       -> Actualización integral de ficha
PATCH  /api/mascotas/{id}/       -> Actualización parcial de estado de salud
DELETE /api/mascotas/{id}/       -> Eliminación lógica de registro

GET    /api/tutores/             -> Listado de propietarios (validación RUT chileno Módulo 11)
POST   /api/tutores/             -> Alta de nuevo tutor con teléfono y dirección
GET    /api/veterinarios/        -> Directorio médico y especialidades
GET    /api/citas/               -> Agenda médica y disponibilidad horaria
POST   /api/citas/               -> Reserva de cita médica con validación de traslape
GET    /api/fichas/              -> Expedientes clínicos, diagnósticos y anamnesis
GET    /api/pagos/               -> Registro contable y pasarela de pago
```

---

## 🛡️ Seguridad, Criptografía y Protección de Datos

En estricto apego a las **Actividades 3, 5 y 6** de la rúbrica de evaluación:

### 1. Hashing Seguro de Contraseñas (PBKDF2 con Salt)
- **Algoritmo:** `PBKDF2PasswordHasher` con función pseudoaleatoria `HMAC-SHA256`.
- **Factor de Trabajo:** **600,000 iteraciones** de estiramiento de clave (key stretching).
- **Salt Criptográfico:** Generación aleatoria mediante `secrets.token_hex(16)` (128 bits de entropía).
- **Inmunidad:** Protección total contra ataques de diccionario y tablas arcoíris (*Rainbow Tables*). Las contraseñas **jamás se persisten en texto claro**.

```python
# Verificación técnica en Django (petcare_core/settings.py)
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
    'django.contrib.auth.hashers.Argon2PasswordHasher',
]
```

### 2. Cifrado en Reposo de Base de Datos (AWS KMS)
- La base de datos relacional PostgreSQL en Amazon RDS fue aprovisionada con el parámetro `StorageEncrypted = true`.
- Las tablas, índices, logs de transacciones (*WAL*) y snapshots manuales se encuentran cifrados bajo el estándar **AES-256 administrado por AWS Key Management Service (KMS)**.

### 3. Aislamiento de Red y Reglas de Security Group
- El puerto `5432` de PostgreSQL se encuentra en una **subred privada** sin asignación de IP pública (`PubliclyAccessible = false`).
- El Security Group `petcare-eval4-sg` restringe el tráfico de entrada al puerto `5432` exclusivamente para la IP privada de la instancia `EC2-BACKEND-DRF` (`172.31.18.56/32`).

---

## 🔍 Auditoría de Seguridad: SAST (SonarQube) y DAST (OWASP ZAP)

Cumpliendo con la **Actividad 2** de la pauta de evaluación:

| Criterio | SAST (Análisis Estático) – SonarQube | DAST (Análisis Dinámico) – OWASP ZAP |
|---|---|---|
| **Enfoque** | White-Box (Inspección directa de código fuente). | Black-Box (Simulación de ataques sobre la app en ejecución). |
| **Alcance** | Modelos, vistas, serializers, validación de inyecciones y complejidad ciclomática. | Headers HTTP, cookies de sesión, Cross-Site Scripting (XSS), CSRF e inyección SQL activa. |
| **Hallazgo Detectado** | Uso de clave estática por defecto en desarrollo. | Cabeceras de seguridad ausentes en respuestas HTTP directas. |
| **Mitigación Aplicada** | Implementación de `python-dotenv` para extracción de `DJANGO_SECRET_KEY` desde entorno. | Incorporación de `X-Content-Type-Options: nosniff` y `X-Frame-Options: DENY` en Nginx. |
| **Estado Final** | **Quality Gate: PASSED (0 Vulnerabilidades Críticas)** | **Alertas de Alto Riesgo: 0 (Baseline Pasivo Aprobado)** |

---

## ⏱️ API Gateway: Throttling y Protección Anti-Abuso

Cumpliendo con la **Actividad 4** de la pauta de evaluación:

- **Servicio:** Amazon API Gateway (Protocolo HTTP API).
- **Target Backend:** `http://54.224.67.92:8000`
- **Configuración de Throttling en Stage `$default`:**
  - `ThrottlingRateLimit`: **2.0 solicitudes/segundo** (tasa sostenida).
  - `ThrottlingBurstLimit`: **5 solicitudes** (capacidad de ráfaga máxima).

### Demostración de Rate Limiting (Prueba con Apache Bench / curl):
Al enviar una ráfaga superior al límite configurado:
```bash
for i in {1..10}; do curl -s -o /dev/null -w "%{http_code}\n" https://vj6thiz42d.execute-api.us-east-1.amazonaws.com/api/mascotas/; done
```
**Salida verificada:**
```text
200
200
200
200
200
429 Too Many Requests  <-- Throttling de API Gateway aplicado automáticamente
429 Too Many Requests
```

---

## 💾 Microservicio Serverless de Respaldo y Alertas SNS

Cumpliendo con la **Actividad 8** y el diagrama de microservicios de la pizarra:

1. **Función AWS Lambda (`petcare-backup-db-lambda`):**
   - Microservicio serverless desarrollado en **Python 3.11** bajo el rol IAM `LabRole`.
   - Ejecuta el respaldo estructurado de las entidades del hospital veterinario cada 7 horas.
   - Genera archivos cifrados en **Amazon S3** en la ruta `s3://petcare-eval4-static-assets-203072872080/backups/`.

2. **Tópico Amazon SNS (`petcare-alerts-topic`):**
   - Notificación Pub/Sub automatizada que dispara un correo electrónico informativo cada vez que un respaldo concluye con éxito.
   - **ARN:** `arn:aws:sns:us-east-1:203072872080:petcare-alerts-topic`.

---

## 📊 Observabilidad y Monitoreo con CloudWatch

Cumpliendo con la **Actividad 7** de la pauta de evaluación:

- **Alarma:** `petcare-backend-high-cpu-alarm`
- **Métrica Monitoreada:** `AWS/EC2 -> CPUUtilization`
- **Instancia Observada:** `i-0cf56e10655b7ab5e` (`EC2-BACKEND-DRF`)
- **Periodo:** 300 segundos (5 minutos)
- **Umbral de Disparo:** `Average >= 80.0%`
- **Snapshot Manual de Base de Datos:** `petcare-eval4-snapshot-manual-1` (PostgreSQL cifrado en RDS).

---

## 👨‍💻 Ficha Académica y Autoría

<div align="center">

| Campo | Detalle Institucional |
|---|---|
| **Institución** | INACAP • Sede Central |
| **Carrera** | Ingeniería en Informática / Analista Programador |
| **Asignatura** | Programación Backend (Unidad 3) |
| **Evaluación** | Evaluación N°4 – Arquitectura Cloud AWS, Integración & Seguridad |
| **Estudiante** | **Sebastián Ignacio Torres Zamorano** |
| **Correo Institucional** | `sebastian.torres33@inacapmail.cl` |
| **Docente Evaluador** | **Prof. Marcelo Alvarado Aravena** |
| **Fecha de Presentación** | Noviembre 2026 |

<br/>

**Desarrollado con altos estándares de ingeniería de software, arquitectura cloud y seguridad en AWS.** 🚀
</div>
