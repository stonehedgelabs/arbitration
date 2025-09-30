import { League } from "../components/LeagueSelector.tsx";

export const leagues: League[] = [
  { id: 'nfl', name: 'National Football League', abbreviation: 'NFL', color: '#013369' },
  { id: 'nba', name: 'National Basketball Association', abbreviation: 'NBA', color: '#C8102E' },
  { id: 'mlb', name: 'Major League Baseball', abbreviation: 'MLB', color: '#002D72' },
  { id: 'nhl', name: 'National Hockey League', abbreviation: 'NHL', color: '#000000' },
  { id: 'mls', name: 'Major League Soccer', abbreviation: 'MLS', color: '#005F45' },
];

export const favoriteTeams = [
  'Dallas Cowboys',
  'Los Angeles Lakers', 
  'New York Yankees',
  'Boston Celtics'
];

export const forYouFeed = [
  {
    id: 'foryou-1',
    type: 'game' as const,
    league: 'NFL',
    leagueColor: '#013369',
    timestamp: '2 hours ago',
    priority: 'high' as const,
    data: {
      homeTeam: { name: 'Dallas Cowboys', score: 21 },
      awayTeam: { name: 'Green Bay Packers', score: 14 },
      status: 'live' as const,
      quarter: 'Q3 8:42'
    }
  },
  {
    id: 'foryou-2',
    type: 'social' as const,
    league: 'NBA',
    leagueColor: '#C8102E',
    timestamp: '1 hour ago',
    priority: 'medium' as const,
    data: {
      author: 'Los Angeles Lakers',
      authorAvatar: 'https://images.unsplash.com/photo-1558453975-d6c57ab62b20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNrZXRiYWxsJTIwZ2FtZSUyMGhpZ2hsaWdodHN8ZW58MXx8fHwxNzU5MTAzNDkxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      content: 'LeBron James reaches another milestone! 🏀👑 What a legend!',
      likes: 15420,
      comments: 892,
      shares: 234,
      verified: true
    }
  },
  {
    id: 'foryou-3',
    type: 'news' as const,
    league: 'MLB',
    leagueColor: '#002D72',
    timestamp: '3 hours ago',
    priority: 'medium' as const,
    data: {
      title: 'Yankees Sign Star Pitcher in Blockbuster Deal',
      summary: 'New York Yankees make major move ahead of next season with record-breaking contract.',
      image: 'https://images.unsplash.com/photo-1634200883060-7385ebfde1b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNlYmFsbCUyMHN0YWRpdW0lMjBjcm93ZHxlbnwxfHx8fDE3NTkxMDM0OTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    }
  },
  {
    id: 'foryou-4',
    type: 'video' as const,
    league: 'NBA',
    leagueColor: '#C8102E',
    timestamp: '4 hours ago',
    priority: 'high' as const,
    data: {
      title: 'Celtics vs Lakers: Best Plays from Last Night',
      thumbnail: 'https://images.unsplash.com/photo-1558453975-d6c57ab62b20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNrZXRiYWxsJTIwZ2FtZSUyMGhpZ2hsaWdodHN8ZW58MXx8fHwxNzU5MTAzNDkxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      duration: '8:32',
      views: '2.1M'
    }
  },
  {
    id: 'foryou-5',
    type: 'game' as const,
    league: 'MLB',
    leagueColor: '#002D72',
    timestamp: '5 hours ago',
    priority: 'medium' as const,
    data: {
      homeTeam: { name: 'New York Yankees', score: 7 },
      awayTeam: { name: 'Boston Red Sox', score: 4 },
      status: 'final' as const
    }
  },
  {
    id: 'foryou-6',
    type: 'social' as const,
    league: 'NFL',
    leagueColor: '#013369',
    timestamp: '6 hours ago',
    priority: 'low' as const,
    data: {
      author: 'NFL Network',
      authorAvatar: 'https://images.unsplash.com/photo-1686947079063-f1e7a7dfc6a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMHN0YWRpdW0lMjBzcG9ydHN8ZW58MXx8fHwxNzU5MDUyOTIzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      content: 'Week 12 Power Rankings are here! Cowboys climb to #3 after dominant performance 📈',
      likes: 8934,
      comments: 456,
      shares: 189,
      verified: true
    }
  }
];

export const mockData = {
  nfl: {
    games: [
      {
        id: 'nfl-1',
        homeTeam: { name: 'Dallas Cowboys', score: 21 },
        awayTeam: { name: 'Green Bay Packers', score: 14 },
        status: 'live' as const,
        time: '2:30 PM ET',
        quarter: 'Q3 8:42'
      },
      {
        id: 'nfl-2',
        homeTeam: { name: 'New England Patriots', score: 17 },
        awayTeam: { name: 'Buffalo Bills', score: 24 },
        status: 'final' as const,
        time: '1:00 PM ET'
      },
      {
        id: 'nfl-3',
        homeTeam: { name: 'Kansas City Chiefs', score: 0 },
        awayTeam: { name: 'Denver Broncos', score: 0 },
        status: 'upcoming' as const,
        time: '8:20 PM ET'
      }
    ],
    plays: [
      {
        id: 'play-1',
        time: '8:42',
        quarter: 'Q3',
        team: 'Dallas Cowboys',
        description: 'Dak Prescott 15 yard touchdown pass to CeeDee Lamb',
        type: 'touchdown' as const
      },
      {
        id: 'play-2',
        time: '9:15',
        quarter: 'Q3',
        team: 'Green Bay Packers',
        description: 'Aaron Rodgers 12 yard pass to Davante Adams',
        type: 'other' as const
      },
      {
        id: 'play-3',
        time: '10:15',
        quarter: 'Q3',
        team: 'Green Bay Packers',
        description: 'Aaron Rodgers sacked for -7 yards by Micah Parsons',
        type: 'other' as const
      },
      {
        id: 'play-4',
        time: '11:30',
        quarter: 'Q3',
        team: 'Dallas Cowboys',
        description: 'Ezekiel Elliott 8 yard run up the middle',
        type: 'other' as const
      },
      {
        id: 'play-5',
        time: '12:03',
        quarter: 'Q3',
        team: 'Dallas Cowboys',
        description: 'Brett Maher 32 yard field goal',
        type: 'field_goal' as const
      },
      {
        id: 'play-6',
        time: '13:45',
        quarter: 'Q2',
        team: 'Green Bay Packers',
        description: 'Timeout called by Green Bay Packers',
        type: 'timeout' as const
      },
      {
        id: 'play-7',
        time: '14:28',
        quarter: 'Q2',
        team: 'Green Bay Packers',
        description: 'Trevon Diggs intercepted pass from Aaron Rodgers',
        type: 'turnover' as const
      }
    ],
    videos: [
      {
        id: '1',
        title: 'Cowboys vs Packers: Best Plays from First Half',
        thumbnail: 'https://images.unsplash.com/photo-1686947079063-f1e7a7dfc6a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMHN0YWRpdW0lMjBzcG9ydHN8ZW58MXx8fHwxNzU5MDUyOTIzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        duration: '4:32',
        views: '125k',
        uploadTime: '2 hours ago',
        category: 'highlights' as const
      },
      {
        id: '2',
        title: 'Breaking Down Dak Prescott\'s Performance',
        thumbnail: 'https://images.unsplash.com/photo-1606335544053-c43609e6155d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBhdGhsZXRlJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzU5MDc0ODIwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        duration: '8:15',
        views: '87k',
        uploadTime: '4 hours ago',
        category: 'analysis' as const
      },
      {
        id: '3',
        title: 'Week 12 NFL Recap: Top Moments',
        thumbnail: 'https://images.unsplash.com/photo-1686947079063-f1e7a7dfc6a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMHN0YWRpdW0lMjBzcG9ydHN8ZW58MXx8fHwxNzU5MDUyOTIzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        duration: '12:01',
        views: '234k',
        uploadTime: '1 day ago',
        category: 'recap' as const
      }
    ],
    social: [
      {
        id: '1',
        author: 'Dallas Cowboys',
        authorAvatar: 'https://images.unsplash.com/photo-1606335544053-c43609e6155d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBhdGhsZXRlJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzU5MDc0ODIwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        content: 'TOUCHDOWN! CeeDee Lamb finds the end zone for his 2nd TD of the game! 🏈🔥',
        timestamp: '5 minutes ago',
        likes: 2847,
        comments: 156,
        shares: 89,
        platform: 'official' as const,
        verified: true
      },
      {
        id: '2',
        author: 'ESPN NFL',
        authorAvatar: 'https://images.unsplash.com/photo-1686947079063-f1e7a7dfc6a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMHN0YWRpdW0lMjBzcG9ydHN8ZW58MXx8fHwxNzU5MDUyOTIzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        content: 'The Cowboys defense is looking dominant today. Micah Parsons with another huge sack!',
        timestamp: '15 minutes ago',
        likes: 1234,
        comments: 67,
        shares: 45,
        platform: 'twitter' as const,
        verified: true
      },
      {
        id: '3',
        author: 'Dak Prescott',
        authorAvatar: 'https://images.unsplash.com/photo-1606335544053-c43609e6155d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBhdGhsZXRlJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzU5MDc0ODIwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        content: 'Great connection with CeeDee today! Team effort all around! 💪 #CowboysNation',
        timestamp: '20 minutes ago',
        likes: 4567,
        comments: 234,
        shares: 156,
        platform: 'instagram' as const,
        verified: true
      },
      {
        id: '4',
        author: 'Green Bay Packers',
        authorAvatar: 'https://images.unsplash.com/photo-1615486511262-b0d1c9c48de5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMGFjdGlvbnxlbnwxfHx8fDE3NTkxMDM0OTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        content: 'Not the result we wanted, but we\'ll bounce back stronger. Proud of the fight this team showed! 🧀',
        timestamp: '1 hour ago',
        likes: 2341,
        comments: 445,
        shares: 78,
        platform: 'official' as const,
        verified: true
      }
    ],
    betting: [
      {
        id: 'nfl-bet-1',
        playerName: 'Dak Prescott',
        position: 'QB',
        team: 'DAL',
        opponent: 'GB',
        gameTime: 'Sun 4:25 PM',
        statType: 'Passing Yards',
        line: 267.5,
        odds: '-110',
        trend: 'up',
        percentage: 78,
        description: 'Dak Prescott has exceeded 267.5 passing yards in 8 of his last 12 games (66.7% hit rate). Green Bay defense allows 251.3 passing yards per game.',
        overUnder: 'over',
        recommendation: 'Strong play'
      },
      {
        id: 'nfl-bet-2',
        playerName: 'CeeDee Lamb',
        position: 'WR',
        team: 'DAL',
        opponent: 'GB',
        gameTime: 'Sun 4:25 PM',
        statType: 'Receiving Yards',
        line: 78.5,
        odds: '+105',
        trend: 'up',
        percentage: 65,
        description: 'CeeDee Lamb has exceeded 78.5 receiving yards in 7 of his last 10 games against NFC North opponents.',
        overUnder: 'over',
        recommendation: 'Good value'
      },
      {
        id: 'nfl-bet-3',
        playerName: 'Micah Parsons',
        position: 'LB',
        team: 'DAL',
        opponent: 'GB',
        gameTime: 'Sun 4:25 PM',
        statType: 'Tackles + Assists',
        line: 6.5,
        odds: '-125',
        trend: 'down',
        percentage: 42,
        description: 'Micah Parsons has failed to exceed 6.5 tackles + assists in 4 of his last 6 games. Packers run more short passing plays.',
        overUnder: 'under',
        recommendation: 'Lean under'
      },
      {
        id: 'nfl-bet-4',
        playerName: 'Aaron Rodgers',
        position: 'QB',
        team: 'GB',
        opponent: 'DAL',
        gameTime: 'Sun 4:25 PM',
        statType: 'Completions',
        line: 23.5,
        odds: '-105',
        trend: 'neutral',
        percentage: 58,
        description: 'Aaron Rodgers averages 24.2 completions per game this season. Cowboys defense allows 22.8 completions per game.',
        overUnder: 'over',
        recommendation: 'Fair line'
      }
    ]
  },
  nba: {
    games: [
      {
        id: 'nba-1',
        homeTeam: { name: 'Los Angeles Lakers', score: 112 },
        awayTeam: { name: 'Boston Celtics', score: 108 },
        status: 'final' as const,
        time: '10:30 PM ET'
      },
      {
        id: 'nba-2',
        homeTeam: { name: 'Golden State Warriors', score: 89 },
        awayTeam: { name: 'Miami Heat', score: 95 },
        status: 'live' as const,
        time: '10:00 PM ET',
        quarter: '4th 3:24'
      }
    ],
    plays: [
      {
        id: '1',
        time: '3:24',
        quarter: '4th',
        team: 'Miami Heat',
        description: 'Jimmy Butler drives to the basket for the layup',
        type: 'other' as const
      },
      {
        id: '2',
        time: '4:15',
        quarter: '4th',
        team: 'Golden State Warriors',
        description: 'Stephen Curry three-pointer from 28 feet',
        type: 'other' as const
      }
    ],
    videos: [
      {
        id: '1',
        title: 'LeBron James Career High Assists Highlights',
        thumbnail: 'https://images.unsplash.com/photo-1558453975-d6c57ab62b20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNrZXRiYWxsJTIwZ2FtZSUyMGhpZ2hsaWdodHN8ZW58MXx8fHwxNzU5MTAzNDkxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        duration: '6:43',
        views: '567k',
        uploadTime: '3 hours ago',
        category: 'highlights' as const
      }
    ],
    social: [
      {
        id: '1',
        author: 'NBA',
        authorAvatar: 'https://images.unsplash.com/photo-1558453975-d6c57ab62b20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNrZXRiYWxsJTIwZ2FtZSUyMGhpZ2hsaWdodHN8ZW58MXx8fHwxNzU5MTAzNDkxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        content: 'What a game! Lakers edge out the Celtics in a thriller 112-108! 🏀',
        timestamp: '1 hour ago',
        likes: 5432,
        comments: 234,
        shares: 156,
        platform: 'official' as const,
        verified: true
      },
      {
        id: '2',
        author: 'LeBron James',
        authorAvatar: 'https://images.unsplash.com/photo-1558453975-d6c57ab62b20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNrZXRiYWxsJTIwZ2FtZSUyMGhpZ2hsaWdodHN8ZW58MXx8fHwxNzU5MTAzNDkxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        content: 'Incredible team effort tonight! AD was unstoppable and the crowd was electric! 👑 #LakeShow',
        timestamp: '2 hours ago',
        likes: 8765,
        comments: 567,
        shares: 234,
        platform: 'instagram' as const,
        verified: true
      },
      {
        id: '3',
        author: 'Boston Celtics',
        authorAvatar: 'https://images.unsplash.com/photo-1558453975-d6c57ab62b20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNrZXRiYWxsJTIwZ2FtZSUyMGhpZ2hsaWdodHN8ZW58MXx8fHwxNzU5MTAzNDkxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        content: 'Hard fought battle tonight. Jayson Tatum showed why he\'s one of the best! We\'ll be back! ☘️',
        timestamp: '2 hours ago',
        likes: 3456,
        comments: 189,
        shares: 89,
        platform: 'official' as const,
        verified: true
      },
      {
        id: '4',
        author: 'ESPN NBA',
        authorAvatar: 'https://images.unsplash.com/photo-1558453975-d6c57ab62b20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNrZXRiYWxsJTIwZ2FtZSUyMGhpZ2hsaWdodHN8ZW58MXx8fHwxNzU5MTAzNDkxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        content: 'Anthony Davis dominates with 24 points and 11 rebounds in Lakers victory over Celtics',
        timestamp: '3 hours ago',
        likes: 1234,
        comments: 78,
        shares: 45,
        platform: 'twitter' as const,
        verified: true
      }
    ],
    betting: [
      {
        id: 'nba-bet-1',
        playerName: 'LeBron James',
        position: 'SF',
        team: 'LAL',
        opponent: 'BOS',
        gameTime: 'Tue 10:30 PM',
        statType: 'Points + Rebounds + Assists',
        line: 54.5,
        odds: '-120',
        trend: 'up',
        percentage: 82,
        description: 'LeBron James has exceeded 54.5 PRA in 9 of his last 11 games. Averages 56.8 PRA against Eastern Conference teams.',
        overUnder: 'over',
        recommendation: 'Strong play'
      },
      {
        id: 'nba-bet-2',
        playerName: 'Anthony Davis',
        position: 'PF',
        team: 'LAL',
        opponent: 'BOS',
        gameTime: 'Tue 10:30 PM',
        statType: 'Rebounds',
        line: 11.5,
        odds: '+110',
        trend: 'up',
        percentage: 73,
        description: 'Anthony Davis has recorded 12+ rebounds in 8 of 12 games this season. Celtics allow 46.2 rebounds per game.',
        overUnder: 'over',
        recommendation: 'Good value'
      },
      {
        id: 'nba-bet-3',
        playerName: 'Jayson Tatum',
        position: 'SF',
        team: 'BOS',
        opponent: 'LAL',
        gameTime: 'Tue 10:30 PM',
        statType: 'Three Pointers Made',
        line: 3.5,
        odds: '-135',
        trend: 'down',
        percentage: 35,
        description: 'Jayson Tatum has made 3 or fewer three-pointers in 6 of his last 8 games. Lakers defense limits 3PT shooting.',
        overUnder: 'under',
        recommendation: 'Strong under'
      },
      {
        id: 'nba-bet-4',
        playerName: 'Stephen Curry',
        position: 'PG',
        team: 'GSW',
        opponent: 'MIA',
        gameTime: 'Wed 10:00 PM',
        statType: 'Three Pointers Made',
        line: 4.5,
        odds: '+125',
        trend: 'up',
        percentage: 71,
        description: 'Stephen Curry has made 5+ three-pointers in 7 of his last 10 home games. Miami allows 13.2 made 3PT per game.',
        overUnder: 'over',
        recommendation: 'Great value'
      }
    ]
  },
  mlb: {
    games: [
      {
        id: 'mlb-1',
        homeTeam: { name: 'New York Yankees', score: 7 },
        awayTeam: { name: 'Boston Red Sox', score: 4 },
        status: 'final' as const,
        time: '7:05 PM ET'
      }
    ],
    plays: [
      {
        id: '1',
        time: 'Top 9th',
        quarter: 'Inning 9',
        team: 'Boston Red Sox',
        description: 'Rafael Devers grounds out to end the game',
        type: 'other' as const
      }
    ],
    videos: [
      {
        id: '1',
        title: 'Yankees vs Red Sox: Game Highlights',
        thumbnail: 'https://images.unsplash.com/photo-1634200883060-7385ebfde1b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNlYmFsbCUyMHN0YWRpdW0lMjBjcm93ZHxlbnwxfHx8fDE3NTkxMDM0OTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        duration: '5:22',
        views: '234k',
        uploadTime: '2 hours ago',
        category: 'highlights' as const
      }
    ],
    social: [
      {
        id: '1',
        author: 'New York Yankees',
        authorAvatar: 'https://images.unsplash.com/photo-1634200883060-7385ebfde1b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNlYmFsbCUyMHN0YWRpdW0lMjBjcm93ZHxlbnwxfHx8fDE3NTkxMDM0OTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        content: 'Another W against our rivals! Great team effort tonight! ⚾️🗽',
        timestamp: '30 minutes ago',
        likes: 1892,
        comments: 89,
        shares: 45,
        platform: 'official' as const,
        verified: true
      },
      {
        id: '2',
        author: 'Aaron Judge',
        authorAvatar: 'https://images.unsplash.com/photo-1634200883060-7385ebfde1b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNlYmFsbCUyMHN0YWRpdW0lMjBjcm93ZHxlbnwxfHx8fDE3NTkxMDM0OTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        content: 'Great team win tonight! Offense was clicking and Gerrit pitched fantastic! 💪⚾️',
        timestamp: '45 minutes ago',
        likes: 5678,
        comments: 234,
        shares: 167,
        platform: 'instagram' as const,
        verified: true
      },
      {
        id: '3',
        author: 'MLB',
        authorAvatar: 'https://images.unsplash.com/photo-1634200883060-7385ebfde1b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNlYmFsbCUyMHN0YWRpdW0lMjBjcm93ZHxlbnwxfHx8fDE3NTkxMDM0OTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        content: 'Yankees vs Red Sox never disappoints! What a classic rivalry matchup at Yankee Stadium! 🔥',
        timestamp: '1 hour ago',
        likes: 2345,
        comments: 156,
        shares: 78,
        platform: 'official' as const,
        verified: true
      },
      {
        id: '4',
        author: 'Boston Red Sox',
        authorAvatar: 'https://images.unsplash.com/photo-1634200883060-7385ebfde1b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNlYmFsbCUyMHN0YWRpdW0lMjBjcm93ZHxlbnwxfHx8fDE3NTkxMDM0OTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        content: 'Tough loss but we fought hard all 9 innings. Rafael Devers continues to be a bright spot! 🔴⚾️',
        timestamp: '1 hour ago',
        likes: 1567,
        comments: 234,
        shares: 45,
        platform: 'official' as const,
        verified: true
      }
    ],
    betting: [
      {
        id: 'mlb-bet-1',
        playerName: 'Aaron Judge',
        position: 'OF',
        team: 'NYY',
        opponent: 'BOS',
        gameTime: 'Tue 7:05 PM',
        statType: 'Total Bases',
        line: 2.5,
        odds: '+145',
        trend: 'up',
        percentage: 68,
        description: 'Aaron Judge has recorded 3+ total bases in 7 of his last 10 games against Red Sox pitching.',
        overUnder: 'over',
        recommendation: 'Good value'
      },
      {
        id: 'mlb-bet-2',
        playerName: 'Gerrit Cole',
        position: 'SP',
        team: 'NYY',
        opponent: 'BOS',
        gameTime: 'Tue 7:05 PM',
        statType: 'Strikeouts',
        line: 7.5,
        odds: '-115',
        trend: 'up',
        percentage: 75,
        description: 'Gerrit Cole has recorded 8+ strikeouts in 6 of his last 8 starts. Red Sox have struck out 9.2 times per game.',
        overUnder: 'over',
        recommendation: 'Strong play'
      },
      {
        id: 'mlb-bet-3',
        playerName: 'Rafael Devers',
        position: '3B',
        team: 'BOS',
        opponent: 'NYY',
        gameTime: 'Tue 7:05 PM',
        statType: 'Hits + Runs + RBIs',
        line: 2.5,
        odds: '+110',
        trend: 'neutral',
        percentage: 52,
        description: 'Rafael Devers averages 2.8 H+R+RBI per game this season. Yankees allow 2.1 H+R+RBI to opposing third basemen.',
        overUnder: 'over',
        recommendation: 'Slight lean'
      }
    ]
  },
  nhl: {
    games: [
      {
        id: '1',
        homeTeam: { name: 'Boston Bruins', score: 3 },
        awayTeam: { name: 'Montreal Canadiens', score: 2 },
        status: 'final' as const,
        time: '7:00 PM ET'
      }
    ],
    plays: [],
    videos: [],
    social: [],
    betting: []
  },
  mls: {
    games: [
      {
        id: '1',
        homeTeam: { name: 'LAFC', score: 2 },
        awayTeam: { name: 'Seattle Sounders', score: 1 },
        status: 'final' as const,
        time: '10:30 PM ET'
      }
    ],
    plays: [],
    videos: [],
    social: [],
    betting: []
  }
};

export const boxScoreData: Record<string, any> = {
  'nfl-1': {
    id: '1',
    homeTeam: {
      name: 'Cowboys',
      city: 'Dallas',
      abbreviation: 'DAL',
      score: 21,
      quarterScores: [7, 7, 7, 0],
      stats: {
        firstDowns: 24,
        totalYards: 412,
        passingYards: 298,
        rushingYards: 114,
        turnovers: 1,
        penalties: 6,
        penaltyYards: 45,
        timeOfPossession: '32:15'
      },
      passingStats: [
        {
          name: 'Dak Prescott',
          position: 'QB',
          completions: 24,
          attempts: 35,
          yards: 298,
          touchdowns: 3,
          interceptions: 0
        }
      ],
      rushingStats: [
        {
          name: 'Ezekiel Elliott',
          position: 'RB',
          carries: 18,
          yards: 89,
          touchdowns: 1,
          longest: 24
        },
        {
          name: 'Tony Pollard',
          position: 'RB',
          carries: 6,
          yards: 25,
          touchdowns: 0,
          longest: 12
        }
      ],
      receivingStats: [
        {
          name: 'CeeDee Lamb',
          position: 'WR',
          receptions: 8,
          yards: 124,
          touchdowns: 2,
          longest: 34
        },
        {
          name: 'Amari Cooper',
          position: 'WR',
          receptions: 6,
          yards: 89,
          touchdowns: 1,
          longest: 28
        },
        {
          name: 'Dalton Schultz',
          position: 'TE',
          receptions: 5,
          yards: 52,
          touchdowns: 0,
          longest: 18
        }
      ]
    },
    awayTeam: {
      name: 'Packers',
      city: 'Green Bay',
      abbreviation: 'GB',
      score: 14,
      quarterScores: [0, 7, 7, 0],
      stats: {
        firstDowns: 19,
        totalYards: 334,
        passingYards: 245,
        rushingYards: 89,
        turnovers: 2,
        penalties: 8,
        penaltyYards: 67,
        timeOfPossession: '27:45'
      },
      passingStats: [
        {
          name: 'Aaron Rodgers',
          position: 'QB',
          completions: 18,
          attempts: 28,
          yards: 245,
          touchdowns: 2,
          interceptions: 2
        }
      ],
      rushingStats: [
        {
          name: 'Aaron Jones',
          position: 'RB',
          carries: 14,
          yards: 67,
          touchdowns: 1,
          longest: 18
        },
        {
          name: 'AJ Dillon',
          position: 'RB',
          carries: 8,
          yards: 22,
          touchdowns: 0,
          longest: 8
        }
      ],
      receivingStats: [
        {
          name: 'Davante Adams',
          position: 'WR',
          receptions: 7,
          yards: 118,
          touchdowns: 1,
          longest: 42
        },
        {
          name: 'Allen Lazard',
          position: 'WR',
          receptions: 4,
          yards: 56,
          touchdowns: 1,
          longest: 23
        },
        {
          name: 'Robert Tonyan',
          position: 'TE',
          receptions: 3,
          yards: 34,
          touchdowns: 0,
          longest: 15
        }
      ]
    },
    gameInfo: {
      date: 'November 28, 2024',
      time: '2:30 PM ET',
      venue: 'AT&T Stadium',
      attendance: '80,259',
      weather: '72°F, Clear',
      status: 'Live - Q3 8:42'
    }
  },
  'nba-1': {
    id: 'nba-1',
    homeTeam: {
      name: 'Lakers',
      city: 'Los Angeles',
      abbreviation: 'LAL',
      score: 112,
      quarterScores: [28, 26, 32, 26],
      stats: {
        firstDowns: 0,
        totalYards: 0,
        passingYards: 0,
        rushingYards: 0,
        turnovers: 14,
        penalties: 18,
        penaltyYards: 24,
        timeOfPossession: '48:00'
      },
      playerStats: [
        {
          name: 'LeBron James',
          position: 'SF',
          points: 28,
          rebounds: 8,
          assists: 12,
          fieldGoals: '11/18',
          minutes: 42
        },
        {
          name: 'Anthony Davis',
          position: 'PF',
          points: 24,
          rebounds: 11,
          assists: 3,
          fieldGoals: '9/15',
          minutes: 38
        },
        {
          name: 'Russell Westbrook',
          position: 'PG',
          points: 18,
          rebounds: 6,
          assists: 8,
          fieldGoals: '7/14',
          minutes: 36
        }
      ]
    },
    awayTeam: {
      name: 'Celtics',
      city: 'Boston',
      abbreviation: 'BOS',
      score: 108,
      quarterScores: [24, 30, 28, 26],
      stats: {
        firstDowns: 0,
        totalYards: 0,
        passingYards: 0,
        rushingYards: 0,
        turnovers: 12,
        penalties: 16,
        penaltyYards: 20,
        timeOfPossession: '48:00'
      },
      playerStats: [
        {
          name: 'Jayson Tatum',
          position: 'SF',
          points: 32,
          rebounds: 7,
          assists: 5,
          fieldGoals: '12/22',
          minutes: 44
        },
        {
          name: 'Jaylen Brown',
          position: 'SG',
          points: 26,
          rebounds: 8,
          assists: 4,
          fieldGoals: '10/18',
          minutes: 40
        },
        {
          name: 'Marcus Smart',
          position: 'PG',
          points: 14,
          rebounds: 3,
          assists: 9,
          fieldGoals: '5/12',
          minutes: 38
        }
      ]
    },
    gameInfo: {
      date: 'November 28, 2024',
      time: '10:30 PM ET',
      venue: 'Crypto.com Arena',
      attendance: '20,000',
      status: 'Final'
    }
  },
  'mlb-1': {
    id: 'mlb-1',
    homeTeam: {
      name: 'Yankees',
      city: 'New York',
      abbreviation: 'NYY',
      score: 7,
      quarterScores: [0, 2, 1, 0, 0, 2, 0, 2, 0],
      stats: {
        firstDowns: 0,
        totalYards: 0,
        passingYards: 0,
        rushingYards: 0,
        turnovers: 0,
        penalties: 0,
        penaltyYards: 0,
        timeOfPossession: '0:00'
      },
      battingStats: [
        {
          name: 'Aaron Judge',
          position: 'RF',
          atBats: 4,
          runs: 2,
          hits: 3,
          rbis: 2,
          average: '.311'
        },
        {
          name: 'Gleyber Torres',
          position: '2B',
          atBats: 4,
          runs: 1,
          hits: 2,
          rbis: 1,
          average: '.278'
        },
        {
          name: 'Anthony Rizzo',
          position: '1B',
          atBats: 3,
          runs: 1,
          hits: 1,
          rbis: 2,
          average: '.224'
        }
      ],
      pitchingStats: [
        {
          name: 'Gerrit Cole',
          position: 'SP',
          innings: '7.0',
          hits: 6,
          runs: 3,
          strikeouts: 9,
          era: '3.20'
        }
      ]
    },
    awayTeam: {
      name: 'Red Sox',
      city: 'Boston',
      abbreviation: 'BOS',
      score: 4,
      quarterScores: [1, 0, 0, 2, 0, 0, 1, 0, 0],
      stats: {
        firstDowns: 0,
        totalYards: 0,
        passingYards: 0,
        rushingYards: 0,
        turnovers: 0,
        penalties: 0,
        penaltyYards: 0,
        timeOfPossession: '0:00'
      },
      battingStats: [
        {
          name: 'Rafael Devers',
          position: '3B',
          atBats: 4,
          runs: 1,
          hits: 2,
          rbis: 2,
          average: '.295'
        },
        {
          name: 'Xander Bogaerts',
          position: 'SS',
          atBats: 4,
          runs: 1,
          hits: 1,
          rbis: 0,
          average: '.307'
        },
        {
          name: 'J.D. Martinez',
          position: 'DH',
          atBats: 3,
          runs: 0,
          hits: 1,
          rbis: 1,
          average: '.274'
        }
      ],
      pitchingStats: [
        {
          name: 'Nathan Eovaldi',
          position: 'SP',
          innings: '6.0',
          hits: 8,
          runs: 5,
          strikeouts: 6,
          era: '3.87'
        }
      ]
    },
    gameInfo: {
      date: 'November 28, 2024',
      time: '7:05 PM ET',
      venue: 'Yankee Stadium',
      attendance: '47,309',
      status: 'Final'
    }
  }
};