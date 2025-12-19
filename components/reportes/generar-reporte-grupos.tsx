'use client'

import BotonReporte from './boton-reporte'

interface Grupo {
  id: number
  nombre: string
  grado: number | null
  turno: string | null
  periodo: { nombre: string } | null
}

interface GenerarReporteGruposProps {
  grupos: Grupo[]
  alumnosPorGrupo: Record<number, number>
}

export default function GenerarReporteGrupos({ grupos, alumnosPorGrupo }: GenerarReporteGruposProps) {
  const generarReporte = () => {
    // Crear ventana de impresión
    const ventana = window.open('', '_blank')
    if (!ventana) return

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reporte de Grupos</title>
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
            border-bottom: 3px solid #4F46E5;
            padding-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            color: #4F46E5;
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
          }
          th {
            background-color: #4F46E5;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
          }
          td {
            padding: 12px;
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
            background-color: #EEF2FF;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Reporte de Grupos</h1>
          <p>Fecha: ${new Date().toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}</p>
        </div>

        <div class="stats">
          <p><strong>Total de Grupos:</strong> ${grupos.length}</p>
          <p><strong>Total de Alumnos:</strong> ${Object.values(alumnosPorGrupo).reduce((a, b) => a + b, 0)}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Grupo</th>
              <th>Grado</th>
              <th>Turno</th>
              <th>Periodo</th>
              <th>Alumnos</th>
            </tr>
          </thead>
          <tbody>
            ${grupos.map(grupo => `
              <tr>
                <td><strong>${grupo.nombre}</strong></td>
                <td>${grupo.grado ? grupo.grado + '°' : '-'}</td>
                <td style="text-transform: capitalize">${grupo.turno || '-'}</td>
                <td>${grupo.periodo?.nombre || '-'}</td>
                <td>${alumnosPorGrupo[grupo.id] || 0}</td>
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
