const GAME_PATH = /^\/game\//;

//
// Après un F5 sur /game/:mode la partie (socket, state) est perdue :
// on renvoie le joueur à l'accueil. La décision est prise une seule fois,
// au chargement du bundle, sur l'URL réellement rechargée — le type de
// navigation reste "reload" pour toute la durée du document, donc le
// tester plus tard (au montage de GameRoute) rejetait le premier clic
// sur un mode de jeu après n'importe quel rafraîchissement.
//
export function redirectHomeOnGameReload(): void {
  const entry = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;

  if (entry?.type !== "reload") return;
  if (!GAME_PATH.test(window.location.pathname)) return;

  window.history.replaceState(null, "", "/");
}
