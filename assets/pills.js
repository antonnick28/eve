const getPillElement = id => document.getElementById(id);
const dialog = getPillElement('validation-dialog');
const dialogTitle = getPillElement('validation-title');
const dialogMessage = getPillElement('validation-message');
const closeDialog = getPillElement('validation-close');
const savePill = getPillElement('save-pill');
let activePill = null;
const extraMessages = {
  'Para los días difíciles': ['No tienes que ser perfecta para merecer descanso, amor y cosas bonitas. Ya eres suficiente, incluso cuando hoy no te sientas así.', 'Lo difícil de hoy no define todo lo que eres. Ve despacio: sigues siendo valiosa y profundamente querida.', 'Puedes descansar sin haber terminado todo. Tu corazón también necesita un lugar seguro para respirar.'],
  'Para cuando dudes de ti': ['Tu sensibilidad no es demasiado: es una de las formas más lindas que tienes de mirar, entender y cuidar el mundo.', 'No olvides lo lejos que has llegado. La duda hace ruido, pero tu capacidad ha estado contigo todo el tiempo.', 'No necesitas compararte para confirmar tu valor. Hay una forma irrepetible de ser tú.'],
  'Para seguir creciendo': ['Todo lo que estás aprendiendo cuenta. Ve a tu ritmo: tu camino no necesita parecerse al de nadie para ser valioso.', 'Crecer también es equivocarse, aprender y volver a intentarlo. No tienes que hacerlo perfecto para hacerlo bien.', 'Confía en las pequeñas decisiones que tomas por ti: juntas también construyen un camino hermoso.'],
  'Para respirar': ['Está bien pausar. No necesitas tener todas las respuestas hoy; respirar y volver a ti también es avanzar.', 'Por este instante, deja que el mundo espere un poquito. Inhala calma, exhala lo que pesa.', 'No hay prisa para sentirte mejor. Hoy basta con darte un poco de espacio y mucha suavidad.']
};

function hideValidation() {
  dialog.hidden = true;
}

document.querySelectorAll('.capsule').forEach(capsule => {
  capsule.addEventListener('click', () => {
    const title = capsule.dataset.title || 'Una píldora para ti';
    const fallback = capsule.dataset.message || 'Recuerda hablarte con la misma ternura que das a los demás.';
    const options = extraMessages[title] || [fallback, 'No estás sola en lo que sientes. Date permiso de ir a tu ritmo y de tratarte con mucha paciencia.', 'Hay una parte de ti que sabe volver a la calma. Escúchala despacio: también merece tu confianza.'];
    activePill = { title, message: options[Math.floor(Math.random() * options.length)] };
    dialogTitle.textContent = activePill.title;
    dialogMessage.textContent = activePill.message;
    const saved = JSON.parse(localStorage.getItem('eve-pill-favorites') || '[]');
    const isSaved = saved.some(pill => pill.title === activePill.title);
    savePill.textContent = isSaved ? '♥' : '♡';
    savePill.setAttribute('aria-label', isSaved ? 'Quitar de favoritos' : 'Guardar en favoritos');
    dialog.hidden = false;
    closeDialog.focus();
  });
});

savePill.addEventListener('click', () => {
  if (!activePill) return;
  const saved = JSON.parse(localStorage.getItem('eve-pill-favorites') || '[]');
  const exists = saved.some(pill => pill.title === activePill.title);
  localStorage.setItem('eve-pill-favorites', JSON.stringify(exists ? saved.filter(pill => pill.title !== activePill.title) : [...saved, activePill]));
  savePill.textContent = exists ? '♡' : '♥';
  savePill.setAttribute('aria-label', exists ? 'Guardar en favoritos' : 'Quitar de favoritos');
});

closeDialog.addEventListener('click', hideValidation);
dialog.addEventListener('click', event => {
  if (event.target === dialog) hideValidation();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !dialog.hidden) hideValidation();
});
