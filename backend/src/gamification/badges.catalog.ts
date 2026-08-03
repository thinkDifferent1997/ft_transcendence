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
    name: 'First victory',
    description: 'Win your first match.',
  },
  {
    code: 'WINS_10',
    name: 'Regular',
    description: 'Win 10 matches.',
  },
  {
    code: 'WINS_50',
    name: 'Emilien',
    description: 'Win 50 matchs',
  },
  {
    code: 'GAMES_10',
    name: 'Dedicated',
    description: 'Play 10 matches.',
  },
  {
    code: 'GAMES_100',
    name: 'True competitor',
    description: 'Play 100 games.',
  },
  {
    code: 'TOURNAMENT_CHAMPION',
    name: 'Chicken Chicken Winner Chicken',
    description: 'Win a tournament.',
  },
  {
    code: 'PERFECT_GAME',
    name: 'Perfect game',
    description: 'Finish a match with a 100% correct answer rate.',
  },
];
