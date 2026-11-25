# PetCare • Sistema de Gestión de Citas y Fichas Médicas Veterinarias
## Evaluación N°4 – Programación Backend & Arquitectura Cloud AWS
**INACAP 2026 • Unidad 3: Aplicación API RESTful – Arquitectura AWS, Integración y Seguridad**

- **Estudiante:** Sebastián Ignacio Torres Zamorano
- **Docente Evaluador:** Prof. Marcelo Alvarado Aravena
- **Repositorio Oficial:** [https://github.com/sebatmail/AWS-BACKEND-4.git](https://github.com/sebatmail/AWS-BACKEND-4.git)

---

## 🏛️ Arquitectura Distribuida Desacoplada (4 Componentes de Infraestructura)

De acuerdo a la pauta y rúbrica de evaluación, el sistema se encuentra completamente desacoplado y en producción activa en **AWS us-east-1 (Norte de Virginia)**:

| Componente AWS | Nombre / Identificador | Dirección / URL Pública | Propósito y Configuración |
|---|---|---|---|
| **EC2 Frontend** | `EC2-FRONTEND` (`i-09bbdac8df188b72e`) | [http://54.175.250.115/](http://54.175.250.115/) | Servidor Web Node.js 20 + Nginx sirviendo la interfaz React TanStack Start. |
| **EC2 Backend** | `EC2-BACKEND-DRF` (`i-0cf56e10655b7ab5e`) | [http://54.224.67.92/](http://54.224.67.92/) | Servidor API Django REST Framework + Gunicorn + Nginx (Puerto 8000/80). |
| **RDS PostgreSQL** | `petcare-eval4-db` | `petcare-eval4-db.cgx1fyibrg3j.us-east-1.rds.amazonaws.com` | Base de datos PostgreSQL 16.9 gestionada, **cifrada en reposo (KMS)**, puerto 5432 restringido por Security Group a la VPC. |
| **Amazon S3** | `petcare-eval4-static-assets-203072872080` | `s3://petcare-eval4-static-assets-203072872080` | Almacenamiento de archivos estáticos y recursos, con **cifrado en reposo SSE-S3 (AES256)**. |
| **API Gateway** | `petcare-eval4-api-gateway` (`vj6thiz42d`) | `https://vj6thiz42d.execute-api.us-east-1.amazonaws.com` | HTTP API Gateway con **Rate Limiting configurado** (2 req/s, ráfaga de 5 req/s). |
| **CloudWatch** | `petcare-backend-high-cpu-alarm` | Consola CloudWatch us-east-1 | Alarma de observabilidad para `CPUUtilization >= 80%` sobre la instancia de Backend. |

---

## 🔑 Usuarios y Credenciales de Prueba (Para Demostración del Profesor)

| Rol del Sistema | Nombre en Pantalla | Usuario | Contraseña | Permisos y Alcance |
|---|---|---|---|---|
| **Superadministrador** | Prof. Marcelo Alvarado | `profe` | `123456` | Control total, Django Admin, métricas globales. |
| **Administrador** | Sebastián Torres | `admin` | `admin123` | Gestión completa de clínica, profesionales, tutores y finanzas. |
| **Médico Veterinario** | Dr. Rodrigo Morales | `vet` | `vet123` | Fichas clínicas, recetas, vacunas y atención de citas. |
| **Tutor / Cliente** | Camila Alarcón | `tutor` | `tutor123` | Agendamiento de horas y simulación de pagos. |
| **Invitado** | Modo Lectura | *Sin login* | *N/A* | Modo solo lectura. Botones de mutación bloqueados con aviso. |

---

## 🚀 Endpoints RESTful y Autenticación JWT

### 1. Autenticación JWT (JSON Web Tokens)
- `POST https://vj6thiz42d.execute-api.us-east-1.amazonaws.com/api/token/`: Obtención de par de tokens (`access` y `refresh`).
- `POST https://vj6thiz42d.execute-api.us-east-1.amazonaws.com/api/token/refresh/`: Renovación del token de acceso.
- `POST https://vj6thiz42d.execute-api.us-east-1.amazonaws.com/api/token/verify/`: Verificación de validez de token.

### 2. Endpoints CRUD del Dominio Clínico
- `GET/POST /api/mascotas/`: Listar y registrar pacientes caninos, felinos y exóticos.
- `GET/PUT/DELETE /api/mascotas/{id}/`: Detalle, actualización y eliminación de paciente.
- `GET/POST /api/tutores/`: Gestión de propietarios con validación oficial de RUT chileno (Módulo 11).
- `GET/POST /api/veterinarios/`: Registro del cuerpo médico veterinario.
- `GET/POST /api/citas/`: Agenda y reserva de consultas médicas.
- `GET/POST /api/fichas/`: Expedientes clínicos, diagnósticos y tratamientos.
- `GET/POST /api/pagos/`: Conciliación de pagos (Webpay Plus, Mercado Pago, Transferencia).

---

## 🛡️ Controles de Seguridad Obligatorios (Rúbrica Eva 4)

1. **Protección de Contraseñas (Actividad 3):**
   - Django almacena contraseñas mediante **PBKDF2 con HMAC-SHA256 y Salt criptográfico aleatorio** de 128 bits.
   - Las contraseñas jamás se guardan en texto plano en la base de datos RDS.
2. **Rate Limiting / Throttling (Actividad 4):**
   - Configurado en Amazon API Gateway: `ThrottlingRateLimit = 2.0` y `ThrottlingBurstLimit = 5`.
   - Al sobrepasar el umbral de ráfaga, la API retorna código de estado `HTTP 429 Too Many Requests`.
3. **Seguridad en Reposo y Tráfico (Actividades 5 y 6):**
   - RDS PostgreSQL provisionado con cifrado nativo en disco mediante AWS KMS (`StorageEncrypted = true`).
   - S3 Bucket configurado con cifrado por defecto `AES256` (SSE-S3).
   - Acceso al puerto `5432` restringido a nivel de Security Group únicamente para las instancias de la VPC.
4. **Estrategia de Respaldo cada 7 horas (Actividad 8):**
   - Dado que los respaldos nativos de RDS operan con periodicidad diaria (24 horas), la política para respaldos cada 7 horas se implementa mediante **Amazon EventBridge Scheduler** invocando una función **AWS Lambda** que ejecuta la llamada a la API `CreateDBSnapshot`.
5. **Análisis de Seguridad SAST y DAST (Actividad 2):**
   - **SAST (SonarQube):** Análisis estático sobre el código fuente de Django.
   - **DAST (OWASP ZAP):** Exploración dinámica pasiva y activa sobre los endpoints públicos de la aplicación.
