export type TemplateType = 'journal' | 'task' | 'media';

export interface Template {
  id: string;
  label: string;
  description?: string;
  content?: string; // For journal/media body
  title?: string; // For journal/task/media title
  // Task specific
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  // Journal specific
  tags?: string[];
  // Media specific
  mediaType?: 'movie' | 'tv' | 'book' | 'game';
  rating?: number;
}

export const TEMPLATES: Record<TemplateType, Template[]> = {
  journal: [
    {
      id: 'daily-reflection',
      label: 'Daily Reflection',
      description: 'End of day reflection and gratitude',
      tags: ['daily', 'reflection'],
      content: `## 📅 Daily Reflection

### 🌟 3 Things I'm Grateful For
1. 
2. 
3. 

### 🏆 Wins of the Day
- 

### 📉 Challenges & Learnings
- 

### 🔮 Focus for Tomorrow
- `
    },
    {
      id: 'morning-pages',
      label: 'Morning Pages',
      description: 'Stream of consciousness writing',
      tags: ['morning-pages', 'stream-of-consciousness'],
      content: `## ☀️ Morning Pages

*Clear your mind...*

`
    },
    {
      id: 'dream-journal',
      label: 'Dream Journal',
      description: 'Record your dreams',
      tags: ['dream'],
      content: `## 🌙 Dream Journal

### 💭 Description
*What happened in the dream?*

### 🎭 Themes & Symbols
- 

### 🧘 Interpretation
*What might this mean?*
`
    },
    {
      id: 'weekly-review',
      label: 'Weekly Review',
      description: 'Review the past week',
      tags: ['weekly-review'],
      content: `## 📅 Weekly Review

### 📊 Highlights
- 

### 🚧 Lowlights
- 

### 🎯 Goal Progress
- 

### 📝 Plan for Next Week
- `
    }
  ],
  task: [
    {
      id: 'weekly-review-task',
      label: 'Weekly Review',
      description: 'Schedule your weekly review',
      title: 'Weekly Review',
      priority: 'high',
      category: 'Planning'
    },
    {
      id: 'meal-prep',
      label: 'Meal Prep',
      description: 'Plan and prep meals',
      title: 'Meal Prep for the Week',
      priority: 'medium',
      category: 'Health'
    },
    {
      id: 'grocery-shopping',
      label: 'Grocery Shopping',
      description: 'Weekly grocery run',
      title: 'Grocery Shopping',
      priority: 'medium',
      category: 'Chores'
    },
    {
      id: 'workout',
      label: 'Workout',
      description: 'General workout task',
      title: 'Workout',
      priority: 'medium',
      category: 'Health'
    }
  ],
  media: [
    {
      id: 'book-review',
      label: 'Book Review',
      description: 'Standard book review format',
      mediaType: 'book',
      content: `## 📚 Book Review

### 📝 Summary
*Brief summary of the book...*

### 🔑 Key Takeaways
- 
- 
- 

### 💭 Thoughts & Analysis
*What did you think about the writing style, characters, etc?*

### ⭐ Verdict
*Who would you recommend this to?*
`
    },
    {
      id: 'movie-review',
      label: 'Movie Review',
      description: 'Standard movie review format',
      mediaType: 'movie',
      content: `## 🎬 Movie Review

### 📝 Plot Summary
*Brief summary without major spoilers...*

### 🎭 Acting & Directing
- 

### 🎨 Visuals & Sound
- 

### ⭐ Verdict
*Worth watching?*
`
    },
    {
      id: 'game-review',
      label: 'Game Review',
      description: 'Standard game review format',
      mediaType: 'game',
      content: `## 🎮 Game Review

### 🕹️ Gameplay
- 

### 📖 Story
- 

### 🎨 Graphics & Audio
- 

### ⭐ Verdict
*Fun factor?*
`
    }
  ]
};
