'use client'

import BotonReporte from './boton-reporte'

interface Maestro {
  id: number
  nombre: string
  especialidad: string | null
  correo: string | null
  telefono: string | null
  activo: boolean
}

interface GenerarReporteMaestrosProps {
  maestros: Maestro[]
}

export default function GenerarReporteMaestros({ maestros }: GenerarReporteMaestrosProps) {
  const generarReporte = () => {
    const ventana = window.open('', '_blank')
    if (!ventana) return

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reporte de Maestros</title>
        <style>
          @media print {
            body { margin: 0; }
            @page { margin: 2cm; }
          }
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #3B82F6;
            padding-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            color: #3B82F6;
            font-size: 28px;
          }
          .header p {
            margin: 10px 0 0 0;
            color: #666;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 13px;
          }
          th {
            background-color: #3B82F6;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: 600;
          }
          td {
            padding: 10px 8px;
            border-bottom: 1px solid #E5E7EB;
          }
          tr:hover {
            background-color: #F9FAFB;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          .stats {
            background-color: #DBEAFE;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
          }
          .activo {
            background-color: #D1FAE5;
            color: #065F46;
          }
          .inactivo {
            background-color: #F3F4F6;
            color: #6B7280;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Reporte de Maestros</h1>
          <p>Fecha: ${new Date().toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}</p>
        </div>

        <div class="stats">
          <p><strong>Total de Maestros:</strong> ${maestros.length}</p>
          <p><strong>Activos:</strong> ${maestros.filter(m => m.activo).length}</p>
          <p><strong>Inactivos:</strong> ${maestros.filter(m => !m.activo).length}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Especialidad</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${maestros.map(maestro => `
              <tr>
                <td><strong>${maestro.nombre}</strong></td>
                <td>${maestro.especialidad || 'Sin especialidad'}</td>
                <td>${maestro.correo || '-'}</td>
                <td>${maestro.telefono || '-'}</td>
                <td>
                  <span class="badge ${maestro.activo ? 'activo' : 'inactivo'}">
                    ${maestro.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Sistema Escolar - Reporte generado automáticamente</p>
        </div>

        <script>
          window.onload = () => {
            window.print();
            window.onafterprint = () => window.close();
          }
        </script>
      </body>
      </html>
    `

    ventana.document.write(html)
    ventana.document.close()
  }

  return <BotonReporte titulo="Generar Reporte" onGenerar={generarReporte} />
}
