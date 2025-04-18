-- Crear enum para tipo de ticket si no existe
CREATE TYPE IF NOT EXISTS ticket_type AS ENUM (
  -- Alta Prioridad (Urgente)
  'internet_outage',
  'os_boot_failure',
  'malware_detected',
  'email_access_lost',
  'critical_hardware_failure',
  'essential_platform_error',
  'account_lockout',

  -- Media Prioridad
  'intermittent_internet',
  'printer_issues',
  'software_installation',
  'non_critical_app_error',
  'cloud_sync_issues',
  'password_reset',
  'tool_config_issue',

  -- Baja Prioridad
  'mobile_email_setup',
  'software_usage_help',
  'file_access_issue',
  'peripheral_setup',
  'remote_access_setup',
  'non_critical_software',
  'minor_display_errors',

  -- Muy Baja Prioridad
  'advanced_feature_help',
  'ui_cosmetic_requests',
  'future_updates_info',
  'disk_space_management',
  'cleanup_request',
  'documentation_errors',
  'support_process_help'
);

-- Agregar columna de tipo y SLA a la tabla tickets si no existen
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS type ticket_type,
ADD COLUMN IF NOT EXISTS sla_hours INTEGER;