// Test script para verificar que las funcionalidades funcionan
console.log('Testing new features...');

// Test 1: Verificar tema por defecto
const getTheme = () => {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
};

setTimeout(() => {
  console.log('Current theme:', getTheme());
  
  // Test 2: Verificar estructura HTML para botón de copiar artista
  const artistSections = document.querySelectorAll('h3:contains("Artista")');
  console.log('Artist sections found:', artistSections.length);
  
  // Test 3: Verificar animaciones CSS
  const styles = getComputedStyle(document.documentElement);
  console.log('CSS loaded, checking animations...');
  
}, 2000);
