/* Erzeugt Rätsel im Hintergrund, damit die Oberfläche flüssig bleibt. */
importScripts('sudoku.js');
self.onmessage = function (e) {
  const { id, N, difficulty } = e.data;
  try { self.postMessage({ id, puzzle: Sudoku.generate(N, difficulty) }); }
  catch (err) { self.postMessage({ id, error: String(err) }); }
};
