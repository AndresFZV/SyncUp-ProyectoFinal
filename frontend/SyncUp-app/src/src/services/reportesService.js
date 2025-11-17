import api from './api';

/**
 * RF-009: Descargar reporte del usuario
 */
export const descargarReporteUsuario = async () => {
  try {
    const username = localStorage.getItem('userName');
    console.log(`[Reportes Service] Descargando reporte para ${username}`);

    const response = await api.get(`/usuarios/reporte/${username}`, {
      responseType: 'blob'
    });

    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const fecha = new Date().toISOString().split('T')[0];
    link.download = `SyncUp_Reporte_${username}_${fecha}.csv`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('[Reportes Service] ✅ Reporte descargado exitosamente');
    return true;

  } catch (error) {
    console.error('[Reportes Service] ❌ Error al descargar reporte:', error);
    throw new Error(
      error.response?.data?.mensaje || 
      'Error al generar el reporte'
    );
  }
};

/**
 * RF-010: Descargar reporte global del sistema (Administrador)
 */
export const descargarReporteGlobal = async () => {
  try {
    console.log('[Reportes Service] Descargando reporte global del sistema');

    const response = await api.get('/usuarios/reporte-global', {
      responseType: 'blob'
    });

    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const fecha = new Date().toISOString().split('T')[0];
    link.download = `SyncUp_Reporte_Global_${fecha}.csv`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('[Reportes Service] ✅ Reporte global descargado exitosamente');
    return true;

  } catch (error) {
    console.error('[Reportes Service] ❌ Error al descargar reporte global:', error);
    throw new Error(
      error.response?.data?.mensaje || 
      'Error al generar el reporte global'
    );
  }
};

export default {
  descargarReporteUsuario,
  descargarReporteGlobal
};
