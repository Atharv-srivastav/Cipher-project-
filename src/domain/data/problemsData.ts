import { ProblemData } from '../entities/Problem.ts';

export const SEED_PROBLEMS_DATA: ProblemData[] = [
  {
    id: 'prob-parking-lot',
    title: 'Design a Parking Lot',
    slug: 'design-parking-lot',
    difficulty: 'MEDIUM',
    shortDescription: 'Design an automated multi-floor parking lot system handling multiple vehicle types, spot assignment strategies, and ticket calculation.',
    requirements: [
      'Support multiple vehicle types: Motorcycle, Car, Bus.',
      'Support multiple floors with designated spot sizes (Small, Medium, Large).',
      'Flexible spot assignment strategy (First-Available, Nearest to Entrance).',
      'Hourly pricing strategy with ticket validation upon exit.',
      'Real-time display board showing available spots per floor.'
    ],
    expectedEntities: ['ParkingLot', 'ParkingFloor', 'ParkingSpot', 'Vehicle', 'Ticket', 'PaymentService', 'SpotAssignmentStrategy'],
    tags: ['Strategy Pattern', 'Composition', 'Pricing Rules'],
    estimatedMinutes: 45
  },
  {
    id: 'prob-elevator',
    title: 'Design an Elevator Management System',
    slug: 'design-elevator-system',
    difficulty: 'HARD',
    shortDescription: 'Design a multi-elevator control system for a high-rise building with dispatch strategies and request queues.',
    requirements: [
      'Control multiple elevator cars across N floors.',
      'Process internal floor requests (inside car) and external floor requests (up/down hall buttons).',
      'Support dynamic elevator dispatch strategy (LOOK / SCAN algorithm).',
      'Handle door open/close states, emergency stop, and weight sensors.'
    ],
    expectedEntities: ['ElevatorSystem', 'ElevatorCar', 'ElevatorController', 'DispatchStrategy', 'InternalButton', 'HallButton', 'RequestQueue'],
    tags: ['State Machine', 'Dispatch Strategy', 'Concurrency'],
    estimatedMinutes: 60
  },
  {
    id: 'prob-vending-machine',
    title: 'Design a Vending Machine',
    slug: 'design-vending-machine',
    difficulty: 'EASY',
    shortDescription: 'Design a vending machine operating state machine (Idle, HasMoney, ItemSelected, Dispensed).',
    requirements: [
      'Support multiple states: IdleState, HasMoneyState, ItemSelectedState, SoldOutState.',
      'Process coin/cash insertions and calculate change.',
      'Inventory tracking per rack slot.',
      'Dispense item and return remaining change gracefully.'
    ],
    expectedEntities: ['VendingMachine', 'State', 'Inventory', 'Item', 'Coin', 'DispenseService'],
    tags: ['State Pattern', 'Inventory', 'Transactions'],
    estimatedMinutes: 30
  },
  {
    id: 'prob-rate-limiter',
    title: 'Design an In-Memory Rate Limiter',
    slug: 'design-rate-limiter',
    difficulty: 'MEDIUM',
    shortDescription: 'Design a flexible in-memory rate limiter supporting multiple rate limiting algorithms.',
    requirements: [
      'Support client IP / User ID rate limiting.',
      'Pluggable rate limit strategies: Token Bucket, Leaky Bucket, Sliding Window Counter.',
      'Configurable thresholds per tier (Free: 10 req/min, Premium: 100 req/min).',
      'Thread-safe execution and fast sub-millisecond decision latency.'
    ],
    expectedEntities: ['RateLimiter', 'RateLimitStrategy', 'TokenBucket', 'ClientRules', 'LimitResult'],
    tags: ['Strategy Pattern', 'Concurrency', 'Performance'],
    estimatedMinutes: 40
  },
  {
    id: 'prob-notification-service',
    title: 'Design a Notification System',
    slug: 'design-notification-system',
    difficulty: 'MEDIUM',
    shortDescription: 'Design a multi-channel notification routing engine (Email, SMS, Push) with fallback and rate limiting.',
    requirements: [
      'Support multiple channels: Email, SMS, Push Notification.',
      'Support user notification preferences and channel priority.',
      'Pluggable provider gateways (Twilio, SendGrid, FCM) with automatic failover.',
      'Template parsing engine for message formatting.'
    ],
    expectedEntities: ['NotificationService', 'Notification', 'ChannelGateway', 'UserPreference', 'TemplateEngine'],
    tags: ['Observer Pattern', 'Strategy Pattern', 'Failover'],
    estimatedMinutes: 45
  },
  {
    id: 'prob-tic-tac-toe',
    title: 'Design Tic-Tac-Toe',
    slug: 'design-tic-tac-toe',
    difficulty: 'EASY',
    shortDescription: 'Design an N x N scalable Tic-Tac-Toe game board with dynamic move validation and win condition checking.',
    requirements: [
      'Support custom board dimensions (3x3 up to N x N).',
      'Support 2 or more players with custom symbols.',
      'Fast O(1) win evaluation after every move.',
      'Game state tracking (In Progress, Draw, Won).'
    ],
    expectedEntities: ['TicTacToeGame', 'Board', 'Player', 'Move', 'WinningStrategy', 'Symbol'],
    tags: ['Strategy Pattern', 'Game State', 'Validation'],
    estimatedMinutes: 30
  },
  {
    id: 'prob-library-management',
    title: 'Design a Library Management System',
    slug: 'design-library-management',
    difficulty: 'MEDIUM',
    shortDescription: 'Design an automated library system managing cataloging, book borrowing/returning, fine calculation, and reservation queues.',
    requirements: [
      'Search books by Title, Author, Category, or ISBN.',
      'Issue books to members with maximum loan limits and due dates.',
      'Calculate overdue fines based on daily rates.',
      'Manage reservation queues for currently borrowed books.'
    ],
    expectedEntities: ['Library', 'BookItem', 'Member', 'Librarian', 'Barcode', 'FineStrategy', 'ReservationQueue'],
    tags: ['Strategy Pattern', 'Reservations', 'Search'],
    estimatedMinutes: 45
  },
  {
    id: 'prob-splitwise',
    title: 'Design Splitwise (Expense Sharing)',
    slug: 'design-splitwise-expense-sharing',
    difficulty: 'HARD',
    shortDescription: 'Design an expense-sharing application to split group bills equally, by exact amounts, or by percentages with debt simplification.',
    requirements: [
      'Support multiple split strategies: Equal, Exact, Percentage.',
      'Maintain user balances and ledger transactions across groups.',
      'Support group and non-group multi-party expense entries.',
      'Balance simplification algorithm to minimize total transaction count.'
    ],
    expectedEntities: ['SplitwiseService', 'User', 'Group', 'Expense', 'Split', 'SplitStrategy', 'BalanceSheet'],
    tags: ['Strategy Pattern', 'Ledger', 'Graph Simplification'],
    estimatedMinutes: 50
  }
];

