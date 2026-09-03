export interface PresetGroup {
  id: string;
  title: string;
  description: string;
  iconName: string;
  names: string[];
}

export const PRESET_GROUPS: PresetGroup[] = [
  {
    id: 'classroom_students',
    title: '🍎 Class Roster (24 Students)',
    description: 'Full student roster for fair cold-calling and turns',
    iconName: 'GraduationCap',
    names: [
      'Emma Watson', 'Liam Smith', 'Olivia Johnson', 'Noah Williams',
      'Sophia Brown', 'Jackson Davis', 'Ava Miller', 'Lucas Wilson',
      'Isabella Moore', 'Ethan Taylor', 'Mia Anderson', 'Oliver Thomas',
      'Charlotte Jackson', 'Aiden White', 'Amelia Harris', 'Elijah Martin',
      'Harper Clark', 'James Lewis', 'Evelyn Robinson', 'Benjamin Walker',
      'Mateo Rodriguez', 'Chloe Campbell', 'Daniel Kim', 'Zoe Chen'
    ]
  },
  {
    id: 'classroom_jobs',
    title: '🧹 Classroom Helper Jobs',
    description: 'Weekly student helper duty assignments',
    iconName: 'Sparkles',
    names: [
      '🚪 Line Leader & Door Holder',
      '📝 Paper & Homework Passer',
      '🧹 Whiteboard & Eraser Cleaner',
      '💻 Tech & Smartboard Monitor',
      '🪴 Class Plant & Pet Caretaker',
      '📚 Library & Bookshelf Organizer',
      '⏰ Attendance & Time Keeper',
      '🥪 Lunch Box & Water Courier',
      '🎨 Art Supplies Manager',
      '📦 Equipment & Recess Captain'
    ]
  },
  {
    id: 'school_rewards',
    title: '🏆 Classroom Rewards & Privileges',
    description: 'Exciting incentives, prize box tokens, and passes',
    iconName: 'Gift',
    names: [
      '🌟 Sit at Teacher’s Rolling Chair',
      '⏰ +10 Minutes Extra Recess',
      '👑 First in Line for Lunch',
      '🎧 Listen to Music During Work',
      '✏️ Pick from the Fun Eraser / Sticker Box',
      '🎟️ Homework Pass (1 Assignment)',
      '🛋️ Choose Your Seat for the Day',
      '📖 Pick the Class Read-Aloud Story',
      '🎨 Lead the 5-Minute Brain Break Game',
      '☕ Free Hot Cocoa / Fruit Snack Cup'
    ]
  },
  {
    id: 'reading_groups',
    title: '📚 Reading & STEM Teams',
    description: 'Group project teams and station rotation names',
    iconName: 'Users',
    names: [
      '🚀 Rocket Scientists',
      '🌟 Cosmic Voyagers',
      '🦁 Golden Gryphons',
      '⚡ Quantum Sparks',
      '🦉 Wisdom Seekers',
      '🐬 Deep Sea Explorers',
      '🌲 Forest Navigators',
      '🎯 Goal Strikers'
    ]
  },
  {
    id: 'discussion_prompts',
    title: '💭 Morning Meeting & Icebreakers',
    description: 'Engaging prompts for circle time and discussions',
    iconName: 'MessageSquare',
    names: [
      'What was the best part of your weekend?',
      'If you could invent one rule for school, what would it be?',
      'Share one thing you are proud of this week!',
      'What book, movie, or game character would you be?',
      'Give a sincere shout-out to a classmate!',
      'What is your favorite subject and why?',
      'If you could travel anywhere right now, where?',
      'Teach the class your favorite tongue twister!'
    ]
  },
  {
    id: 'table_groups',
    title: '🔢 Table & Desk Numbers (1-20)',
    description: 'Quick table group and student number calling',
    iconName: 'Hash',
    names: Array.from({ length: 20 }, (_, i) => `Student #${i + 1}`)
  }
];

export const CAPSULE_PALETTES = [
  { bg: 'from-[#0A568C] to-[#0d6ab0]', border: 'border-[#8CB23E]', text: 'text-white', glow: 'rgba(10,86,140,0.45)' }, // Nexgen Navy — primary brand
  { bg: 'from-[#8CB23E] to-[#a8d44a]', border: 'border-[#01173B]', text: 'text-[#01173B]', glow: 'rgba(140,178,62,0.45)' }, // Orbit Green — accent swoosh
  { bg: 'from-[#01173B] to-[#0A2a5c]', border: 'border-[#009CFF]', text: 'text-white', glow: 'rgba(1,23,59,0.5)' }, // Midnight Navy — dark badge
  { bg: 'from-[#009CFF] to-[#0A568C]', border: 'border-white', text: 'text-white', glow: 'rgba(0,156,255,0.45)' }, // Electric Cyan — tier highlight
  { bg: 'from-white to-slate-100', border: 'border-[#01173B]', text: 'text-[#01173B]', glow: 'rgba(255,255,255,0.6)' }, // Pure White — card bg
  { bg: 'from-amber-400 to-yellow-500', border: 'border-yellow-200', text: 'text-slate-900', glow: 'rgba(245, 158, 11, 0.45)' }, // Warm accent
  { bg: 'from-emerald-500 to-teal-600', border: 'border-emerald-200', text: 'text-white', glow: 'rgba(16, 185, 129, 0.45)' }, // Chalk Green
  { bg: 'from-sky-400 to-blue-600', border: 'border-sky-200', text: 'text-white', glow: 'rgba(14, 165, 233, 0.45)' }, // Notebook Blue
];
