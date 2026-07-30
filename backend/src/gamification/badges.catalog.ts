export interface BadgeDefinition {
  code: string;
  name: string;
  description: string;
}

// Catalogue figé des badges disponibles. `code` sert de clé stable pour
// l'évaluation et ne doit jamais être renommé une fois en production
// (il identifie le badge, pas son libellé affiché).
export const BADGE_CATALOG: BadgeDefinition[] = [
  {
    code: 'FIRST_WIN',
    name: 'Première victoire',
    description: 'Remporter sa première partie.',
  },
  {
    code: 'WINS_10',
    name: 'Habitué',
    description: 'Remporter 10 parties.',
  },
  {
    code: 'WINS_50',
    name: 'Vétéran',
    description: 'Remporter 50 parties.',
  },
  {
    code: 'GAMES_10',
    name: 'Assidu',
    description: 'Jouer 10 parties.',
  },
  {
    code: 'GAMES_100',
    name: 'Inconditionnel',
    description: 'Jouer 100 parties.',
  },
  {
    code: 'TOURNAMENT_CHAMPION',
    name: 'Champion',
    description: 'Remporter un tournoi.',
  },
  {
    code: 'PERFECT_GAME',
    name: 'Sans faute',
    description: 'Terminer une partie avec 100% de bonnes réponses.',
  },
];
