# Nuxt Gantt Demo

A Vue 3 application demonstrating the [Frappe Gantt](https://github.com/frappe/gantt) library with interactive project timeline visualization.

![Gantt Chart Demo](https://img.shields.io/badge/Vue-3.5.27-brightgreen?logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-7.3.1-646CFF?logo=vite)

## Features

- 📊 **Interactive Gantt Charts** - Multiple demo sections showcasing different capabilities
- 🔗 **Task Dependencies** - Visual arrows showing task relationships
- 📈 **Progress Tracking** - Adjustable progress bars for each task
- 👁️ **Multiple View Modes** - Quarter Day, Half Day, Day, Week, Month, and Year views
- 🎨 **Modern UI** - Clean and responsive design with comprehensive controls
- ⚡ **Fast** - Built with Vite for optimal performance
- 🎛️ **Extensive Customization** - Real-time control over all visual and behavioral aspects

## Demo Sections

The demo includes 6 interactive sections:

### 1. **Edit Access Control**
- Toggle editable/read-only mode
- Control whether dates can be modified
- Control whether progress can be updated
- Demonstrates permission management

### 2. **Versatile Actions**
- Built-in "Scroll to Today" button
- Built-in view mode selector
- Shows how to add custom UI controls to the Gantt chart

### 3. **Mark Holidays**
- Highlight weekends with custom colors
- Display public holidays (16 Indian holidays included)
- Custom weekend definition (e.g., Friday-Saturday vs Saturday-Sunday)
- Multiple highlight colors for different holiday types

### 4. **Ignore Time Periods**
- Completely skip weekends in timeline calculations
- Remove holidays from the timeline
- Tasks automatically adjust to ignore specified dates

### 5. **Style Customization**
- **Grid Controls**: Adjust height, padding, column width
- **Bar Controls**: Modify height, corner radius
- **Arrow Controls**: Adjust dependency arrow curvature
- Real-time visual updates with sliders

### 6. **Advanced Features**
- Custom snap intervals (snap to second, minute, hour, day, month, or year)
- Auto-moving labels that reposition based on available space
- Fine-grained control over user interactions

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

Start the development server:

```bash
pnpm dev
```

The app will be available at `http://localhost:5173` (or another port if 5173 is busy).

### Build

Build for production:

```bash
pnpm build
```

Preview production build:

```bash
pnpm preview
```

## Project Structure

```
nuxt-gantt/
├── gantt/              # Frappe Gantt library (submodule/copy)
│   ├── src/           # Gantt source files
│   │   ├── index.js   # Main Gantt class
│   │   └── styles/    # CSS styles
│   └── package.json
├── src/
│   ├── pages/
│   │   └── index.vue  # Main demo page
│   ├── App.vue
│   └── main.ts
└── package.json
```

## Usage

The Gantt chart is implemented in `src/pages/index.vue`. Here's a basic example:

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Gantt from '../../../gantt/src/index.js'
import '../../../gantt/src/styles/gantt.css'

const ganttContainer = ref<HTMLElement | null>(null)

const tasks = [
  {
    id: 'task-1',
    name: 'Task Name',
    start: new Date(2024, 0, 1),
    end: new Date(2024, 0, 5),
    progress: 50,
    dependencies: ''
  }
]

onMounted(() => {
  new Gantt(ganttContainer.value, tasks, {
    view_mode: 'Day',
    on_click: (task) => console.log(task),
    on_date_change: (task, start, end) => console.log('Date changed'),
    on_progress_change: (task, progress) => console.log('Progress changed')
  })
})
</script>

<template>
  <div ref="ganttContainer"></div>
</template>
```

## Gantt Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `view_mode` | String | 'Day' | Quarter Day, Half Day, Day, Week, Month, Year |
| `bar_height` | Number | 30 | Height of task bars |
| `bar_corner_radius` | Number | 3 | Corner radius of task bars |
| `arrow_curve` | Number | 5 | Curve of dependency arrows |
| `padding` | Number | 18 | Padding around the chart |
| `on_click` | Function | - | Callback when task is clicked |
| `on_date_change` | Function | - | Callback when task dates change |
| `on_progress_change` | Function | - | Callback when progress changes |
| `on_view_change` | Function | - | Callback when view mode changes |
| `readonly` | Boolean | false | Make entire chart read-only |
| `readonly_dates` | Boolean | false | Prevent date modifications |
| `readonly_progress` | Boolean | false | Prevent progress updates |
| `today_button` | Boolean | false | Show "Scroll to Today" button |
| `view_mode_select` | Boolean | false | Show view mode dropdown |
| `holidays` | Object/null | null | Define highlighted dates with colors |
| `ignore` | Array | [] | Array of dates/periods to skip |
| `is_weekend` | Function | - | Custom function to determine weekends |
| `snap_at` | String | '1d' | Snap interval (e.g., '1d', '2h', '30min') |
| `auto_move_label` | Boolean | true | Automatically reposition labels |
| `container_height` | Number | - | Override default chart height |
| `column_width` | Number | 30 | Width of timeline columns |

## Task Object Structure

```typescript
{
  id: string           // Unique task identifier
  name: string         // Task name/title
  start: Date          // Start date
  end: Date            // End date (or use duration)
  duration?: string    // Alternative to end date (e.g., '3d', '2w')
  progress: number     // Progress percentage (0-100)
  dependencies?: string // Comma-separated task IDs
  custom_class?: string // Custom CSS class
  important?: boolean  // Highlight as important
}
```

### Interactive Features

1. **Drag Tasks** - Click and drag a task bar to change its start and end dates
2. **Resize Tasks** - Drag the left or right edge of a task to change duration
3. **Update Progress** - Drag the progress bar within a task
4. **View Modes** - Use the dropdown to switch between different time scales
5. **Dependencies** - Arrows automatically update when dependent tasks move
6. **Permission Control** - Enable/disable editing capabilities dynamically
7. **Visual Customization** - Adjust all visual parameters in real-time
8. **Holiday Marking** - Highlight important dates with custom colors
9. **Timeline Manipulation** - Ignore or skip specific time periods

## Technologies Used

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe development
- **Vite** - Next-generation frontend tooling
- **Frappe Gantt** - Simple, interactive gantt chart library
- **Nuxt UI** - UI component library (optional)

## About Frappe Gantt

This project uses [Frappe Gantt](https://github.com/frappe/gantt), a simple, modern, interactive gantt library for the web. It's a lightweight solution for creating beautiful project timelines without heavy dependencies.

### Key Features of Frappe Gantt:
- Pure JavaScript (no framework required)
- SVG-based rendering
- Lightweight (~15kb gzipped)
- Mobile-friendly
- No external dependencies (except date utilities)

## License

This demo project is open source. The Frappe Gantt library is licensed under MIT.

## Credits

- [Frappe Gantt](https://github.com/frappe/gantt) by Faris Ansari
- Vue 3 by Evan You and the Vue team
- Vite by Evan You and the Vite team