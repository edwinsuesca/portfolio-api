const formatUrlText = (text) => {
    // Reemplazar espacios por guiones
    text = text.replace(/\s+/g, '-');
    
    // Reemplazar slash con guión
    text = text.replace(/[\/]/g, '-');

    // Reemplazar varios guiones o caracteres especiales repetidos con un solo guión
    text = text.replace(/([-_]){2,}/g, '-');
    
    // Eliminar diéresis, tildes y virgulillas
    text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Convertir a minúsculas
    text = text.toLowerCase();
    
    // Eliminar cualquier otro caracter que no sea una letra, número, guión o slash
    text = text.replace(/[^a-z0-9-]/g, '');

    // Eliminar guiones al final y al inicio
    text = text.replace(/^-+/, '').replace(/-+$/, '');
  
    // Si el texto quedó vacío, reemplazar por "sin-titulo"
    if (!text) {
      text = 'sin-titulo';
    }
  
    return text;
}

const validateText = (text) => {
    // Verificar si el texto contiene espacios, diéresis, tildes, virgulillas o caracteres especiales
    if (/[^\w-]/.test(text)) {
      return false;
    }
  
    // Verificar si hay guiones al inicio o al final
    if (/^-|-$/g.test(text)) {
      return false;
    }
  
    // Verificar si hay más de un guión repetido
    if (/([-]){2,}/g.test(text)) {
      return false;
    }
    return true;
}

module.exports = {formatUrlText, validateText};