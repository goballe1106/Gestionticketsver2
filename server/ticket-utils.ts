// Mapeado de tipo de ticket a su prioridad correspondiente
export function getTicketPriorityFromType(ticketType: string | undefined): 'low' | 'medium' | 'high' | 'urgent' {
  if (!ticketType) return 'medium';

  // Alta Prioridad (Urgente)
  if ([
    'internet_outage',
    'os_boot_failure',
    'malware_detected',
    'email_access_lost',
    'critical_hardware_failure',
    'essential_platform_error',
    'account_lockout'
  ].includes(ticketType)) {
    return 'urgent';
  }

  // Media Prioridad
  if ([
    'intermittent_internet',
    'printer_issues',
    'software_installation',
    'non_critical_app_error',
    'cloud_sync_issues',
    'password_reset',
    'tool_config_issue'
  ].includes(ticketType)) {
    return 'medium';
  }

  // Baja Prioridad
  if ([
    'mobile_email_setup',
    'software_usage_help',
    'file_access_issue',
    'peripheral_setup',
    'remote_access_setup',
    'non_critical_software',
    'minor_display_errors'
  ].includes(ticketType)) {
    return 'low';
  }

  // Muy Baja Prioridad (tratada como baja en el sistema)
  if ([
    'advanced_feature_help',
    'ui_cosmetic_requests',
    'future_updates_info',
    'disk_space_management',
    'cleanup_request',
    'documentation_errors',
    'support_process_help'
  ].includes(ticketType)) {
    return 'low';
  }

  return 'medium';
}

// Mapeado de tipo de ticket a su tiempo de SLA en horas
export function getSLAHoursFromType(ticketType: string | undefined): number {
  if (!ticketType) return 24;

  // Alta Prioridad (Urgente) - 4 horas
  if ([
    'internet_outage',
    'os_boot_failure',
    'malware_detected',
    'email_access_lost',
    'critical_hardware_failure',
    'essential_platform_error',
    'account_lockout'
  ].includes(ticketType)) {
    return 4;
  }

  // Media Prioridad - 24 horas
  if ([
    'intermittent_internet',
    'printer_issues',
    'software_installation',
    'non_critical_app_error',
    'cloud_sync_issues',
    'password_reset',
    'tool_config_issue'
  ].includes(ticketType)) {
    return 24;
  }

  // Baja Prioridad - 48 horas
  if ([
    'mobile_email_setup',
    'software_usage_help',
    'file_access_issue',
    'peripheral_setup',
    'remote_access_setup',
    'non_critical_software',
    'minor_display_errors'
  ].includes(ticketType)) {
    return 48;
  }

  // Muy Baja Prioridad - 72 horas
  if ([
    'advanced_feature_help',
    'ui_cosmetic_requests',
    'future_updates_info',
    'disk_space_management',
    'cleanup_request',
    'documentation_errors',
    'support_process_help'
  ].includes(ticketType)) {
    return 72;
  }

  return 24; // Valor predeterminado: 24 horas
}

// Obtener el texto descriptivo del tipo de ticket
export function getTicketTypeText(ticketType: string | undefined): string {
  if (!ticketType) return '';

  const typeDescriptions: Record<string, string> = {
    // Alta Prioridad (Urgente)
    'internet_outage': 'Fallo total en la conexión a internet que impide trabajar',
    'os_boot_failure': 'Sistema operativo no arranca en equipos esenciales',
    'malware_detected': 'Virus o malware detectado en equipos de trabajo',
    'email_access_lost': 'Pérdida de acceso a correo electrónico en todos los dispositivos',
    'critical_hardware_failure': 'Fallo de hardware crítico (disco duro, etc.)',
    'essential_platform_error': 'Error en acceso a plataforma esencial (ERP, CRM, etc.)',
    'account_lockout': 'Bloqueo total de cuenta de usuario',

    // Media Prioridad
    'intermittent_internet': 'Conexión a internet intermitente en algunos usuarios',
    'printer_issues': 'Problemas menores con impresoras',
    'software_installation': 'Solicitud de instalación de software o herramientas',
    'non_critical_app_error': 'Error en aplicación no crítica',
    'cloud_sync_issues': 'Problemas con la sincronización de archivos en la nube',
    'password_reset': 'Restablecimiento de contraseñas para servicios no críticos',
    'tool_config_issue': 'Fallo en la configuración de una herramienta',

    // Baja Prioridad
    'mobile_email_setup': 'Configurar correo electrónico en dispositivos móviles',
    'software_usage_help': 'Consultas sobre cómo realizar tareas básicas en un software',
    'file_access_issue': 'Problemas menores de acceso a archivos o carpetas',
    'peripheral_setup': 'Configuración de impresoras o escáneres',
    'remote_access_setup': 'Configuración de acceso remoto (VPN)',
    'non_critical_software': 'Instalación de programas no críticos',
    'minor_display_errors': 'Errores menores de visualización o gráficos',

    // Muy Baja Prioridad
    'advanced_feature_help': 'Preguntas sobre funciones avanzadas en software',
    'ui_cosmetic_requests': 'Cambios cosméticos en la apariencia de la interfaz',
    'future_updates_info': 'Consultas sobre actualizaciones futuras',
    'disk_space_management': 'Liberar espacio en discos duros personales',
    'cleanup_request': 'Eliminar archivos o aplicaciones no utilizadas',
    'documentation_errors': 'Errores menores en documentación interna',
    'support_process_help': 'Consultas sobre procedimientos de soporte'
  };

  return typeDescriptions[ticketType] || ticketType;
}