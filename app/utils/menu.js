/**
 * Menu data
 * Used in components/game-nav
 */

export default {
  
  tabsList: [
    
    'manager',
    'club',
    'rugby',
    'country',
    'global',
    'support',
    'chat',
    'timeline',
    'alerts',
    'info',
    'settings',
    
  ],
  
  menus: {
    
    manager: [
      
      {
        label: 'Dashboard',
        route: 'dashboard'
      },
      {
        label: 'Account',
        route: 'account',
        hideIfNotAuthenticated: true,
      },
      {
        label: 'Store',
        route: 'store',
        tempRoute: 'coming-soon',
        hideIfNotAuthenticated: true,
      },
      {
        label: 'Shortcuts',
        route: 'shortcuts',
        tempRoute: 'coming-soon',
        hideIfNotAuthenticated: true,
      },
      {
        label: 'More',
        route: 'more',
        tempRoute: 'coming-soon',
        hideIfNotAuthenticated: true,
      },
    
    ],
    
    club: [
      
      {
        label: 'Club',
        route: 'clubs.club',
      },
      {
        label: 'Squad',
        route: 'squad.club',
        params: {
          id: 'me',
        }
      },
      {
        route: 'players',
        menuRoute: 'squad.club',
      },
      {
        label: 'Staff',
        route: 'staff',
        tempRoute: 'coming-soon'
      },
      {
        label: 'Training',
        route: 'training',
        tempRoute: 'coming-soon'
      },
      /*{ // Merge with finances
        label: 'Sponsors',
        route: 'sponsors',
        tempRoute: 'coming-soon'
      },*/
      {
        label: 'Stadium',
        route: 'stadium',
        tempRoute: 'coming-soon'
      },
       
      /*{ // Merge with stadium
        label: 'Facilities',
        route: 'facilities',
        tempRoute: 'coming-soon'
      },*/
      
      {
        label: 'Academy',
        route: 'academy',
        tempRoute: 'coming-soon'
      },
      {
        label: 'Finances',
        route: 'finances',
        tempRoute: 'coming-soon'
      },
      
      /*{ // Merge with history
        label: 'Diary',
        route: 'diary',
        tempRoute: 'coming-soon'
      },*/
      
      {
        label: 'History',
        route: 'history',
        tempRoute: 'coming-soon'
      },
    
    ],
    
    rugby: [
      {
        label: 'League',
        route: 'leagues.league',
        params: {
          id: 'me',
        }
      },
      {
        route: 'league-country.country',
        menuRoute: 'leagues.league',
      },
      {
        label: 'Statistics',
        route: 'statistics',
        tempRoute: 'coming-soon'
      },
      {
        label: 'Friendlies',
        route: 'friendlies',
        tempRoute: 'coming-soon'
      },
      {
        label: 'Live Scoring',
        route: 'live',
        tempRoute: 'coming-soon'
      },
      {
        label: 'Cup',
        route: 'cup',
        tempRoute: 'coming-soon'
      },
    
    ],
    
    country: [
      
      {
        label: 'Summary',
        route: 'country',
        tempRoute: 'coming-soon'
      },
      {
        label: 'Regions',
        route: 'regions',
        tempRoute: 'coming-soon'
      },
      {
        label: 'Competitions',
        route: 'competitions',
        tempRoute: 'coming-soon'
      },
      {
        label: 'Managers',
        route: 'managers',
        tempRoute: 'coming-soon'
      },
      {
        label: 'Promotion Tables',
        route: 'promotions',
        tempRoute: 'coming-soon'
      },
      {
        label: 'Elections',
        route: 'elections',
        tempRoute: 'coming-soon'
      },
      {
        label: 'Stadiums',
        route: 'stadiums',
        tempRoute: 'coming-soon'
      },
      {
        label: 'National Team',
        route: 'national',
        tempRoute: 'coming-soon'
      },
      {
        label: 'U20 Team',
        route: 'u20',
        tempRoute: 'coming-soon'
      },
    
    ],
    
    global: [
      
      {
        label: 'Clubrooms',
        route: 'clubrooms',
        tempRoute: 'coming-soon'
      },
      {
        label: 'Transfer Market',
        route: 'market',
        tempRoute: 'coming-soon'
      },
      {
        label: 'World Cup',
        route: 'worldcup',
        tempRoute: 'coming-soon'
      },
      {
        label: 'Friendly Competitions',
        route: 'friendlycomps',
        tempRoute: 'coming-soon'
      },
      {
        label: 'Rankings',
        route: 'rankings',
        tempRoute: 'coming-soon'
      },
    
    ],
    
    support: [
      
      {
        label: 'Documentation',
        route: 'docs',
        tempRoute: 'coming-soon'
      },
      {
        label: 'Contact Us',
        route: 'contact',
        tempRoute: 'coming-soon'
      },
      {
        label: 'Reporting',
        route: 'reporting',
        tempRoute: 'coming-soon'
      },
      {
        label: 'Credits',
        route: 'credits',
        tempRoute: 'coming-soon'
      },
      {
        label: 'Game Staff',
        route: 'admins',
        tempRoute: 'coming-soon'
      },
    
    ],
    
  }
  
};
