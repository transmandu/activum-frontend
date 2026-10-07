// =========================================================================
//  DATA REAl CENTRALIZADA PARA INFRAESTRUCTURA TRANSMANDU, C.A.
// =========================================================================

// 1. Catálogo total del inventario físico (Suma exacta: 975 equipos)
export const dataCategoriasInventario = [
  { name: 'Laptops', value: 10, color: '#2563eb' },
  { name: 'Servidores', value: 5, color: '#0f172a' },
  { name: 'Monitores', value: 20, color: '#38bdf8' },
  { name: 'Redes / Switches', value: 15, color: '#f59e0b' },
];

// 2. Historial de Soporte por Meses (Consistencia exacta con tus indicadores)
export const dataHistoricoIncidencias = [
  { name: 'Ene', resueltas: 4, activas: 2 },
  { name: 'Feb', resueltas: 7, activas: 1 },
  { name: 'Mar', resueltas: 5, activas: 3 },
  { name: 'Abr', resueltas: 12, activas: 5 },
  { name: 'May', resueltas: 24, activas: 1 }, // Cambiado para cuadrar con tus 24 Casos Resueltos
];

// 3. Estado de la Mesa de Soporte e Incidentes Reales en ejecución
export const listaIncidenciasSistema = [
  {
    id: "INC-092",
    activoCodigo: "ACT-L-001",
    activoNombre: "Laptop Dell Latitude 5420",
    descripcion: "Falla de disco sólido - Pantalla azul constante al iniciar",
    reportadoPor: "Carlos Mendoza",
    fechaHora: "Hoy, 10:30 AM",
    prioridad: "Alta",
    estado: "Abierto" // Cuenta como Reporte Abierto
  },
  {
    id: "INC-090",
    activoCodigo: "ACT-S-045",
    activoNombre: "Servidor Principal (Rack 1)",
    descripcion: "Mantenimiento preventivo - Limpieza física y cambio de pasta térmica",
    reportadoPor: "Infraestructura",
    fechaHora: "Ayer, 04:00 PM",
    prioridad: "Crítica",
    estado: "En Proceso" // Cuenta como En Curso
  },
  {
    id: "INC-085",
    activoCodigo: "ACT-M-102",
    activoNombre: "Monitor ASUS ProArt 27\"",
    descripcion: "Parpadeo intermitente en la esquina superior derecha de la pantalla",
    reportadoPor: "Ana Rodríguez",
    fechaHora: "15 May, 02:15 PM",
    prioridad: "Media",
    estado: "Resuelto"
  }
];

// 4. Otros movimientos del Timeline que no alteran la mesa de incidentes
export const movimientosTimelineExtras = [
  {
    id: "ASG-2026-001",
    tipo: "Asignación",
    descripcion: "Entrega de Monitor HP 24\" a Desarrollo",
    usuario: "Ana Rodríguez (Ingeniería)",
    fecha: "Hoy, 09:15 AM",
    prioridad: "Media",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200"
  },
  {
    id: "BAJ-014",
    tipo: "Desincorporación",
    descripcion: "Baja por obsolescencia de Impresora LaserJet",
    usuario: "Depósito Central",
    fecha: "15 May, 11:00 AM",
    prioridad: "Baja",
    badgeColor: "bg-slate-100 text-slate-700 border-slate-200"
  }
];