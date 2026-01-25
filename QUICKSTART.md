# Quick Start Guide

Get the Frappe Gantt demo up and running in 5 minutes.

## Prerequisites

- Node.js 18 or higher
- pnpm (recommended) or npm

## Installation

```bash
# Clone or navigate to the project directory
cd nuxt-gantt

# Install dependencies
pnpm install
```

## Run the Demo

```bash
# Start the development server
pnpm dev
```

Open your browser to `http://localhost:5173` (or the port shown in the terminal).

## What You'll See

The demo page contains **6 interactive sections**:

### 1️⃣ Edit Access Control
- Toggle editing permissions
- Try dragging tasks when "Editable" is checked vs unchecked
- Control date and progress editing separately

### 2️⃣ Versatile Actions
- Click the "Today" button in the chart to jump to current date
- Use the view mode dropdown in the chart to switch time scales

### 3️⃣ Holiday Marking
- Toggle "Show weekends" to highlight Saturday-Sunday
- Toggle "Custom weekends" to change to Friday-Saturday
- Green highlights = public holidays, Blue = weekends

### 4️⃣ Ignore Time Periods
- Toggle "Ignore weekends" to remove weekends from the timeline
- Notice how tasks extend to account for skipped days

### 5️⃣ Style Customization
- Move the sliders to adjust:
  - **Grid Height**: Overall chart height
  - **Padding**: Space between bars and grid
  - **Column Width**: Width of time columns
  - **Bar Height**: Height of task bars
  - **Radius**: Roundness of bar corners
  - **Arrow Curve**: Curvature of dependency arrows

### 6️⃣ Advanced Features
- Change "Snap By" to control how tasks align when dragged
- Try "1d" (snap to days) vs "2h" (snap to 2-hour increments)
- Toggle "Auto-moving label" to see how task names reposition

## Interactive Features

Try these interactions on any chart:

- **Drag a task bar** → Changes start and end dates
- **Drag left/right edge of a task** → Resizes duration
- **Drag the progress bar** (inner colored bar) → Updates completion percentage
- **Click a task** → View in console (open DevTools)

## Tips

1. **Scroll horizontally** - All charts support horizontal scrolling
2. **Experiment freely** - All changes are instant and reversible
3. **Open DevTools** - Console logs show task interactions
4. **Check scroll preservation** - Notice scroll position stays when adjusting sliders

## File Structure

```
nuxt-gantt/
├── src/
│   └── pages/
│       └── index.vue          ← Main demo implementation
├── gantt/                     ← Frappe Gantt library
│   └── src/
│       ├── index.js           ← Gantt class
│       └── styles/
│           └── gantt.css      ← Gantt styles
└── README.md                  ← Full documentation
```

## Next Steps

- **Customize tasks**: Edit the `tasks`, `tasksSpread`, or `tasksMany` arrays in `index.vue`
- **Add holidays**: Modify the `HOLIDAYS` array with your region's holidays
- **Change colors**: Update holiday color codes in the holidays section
- **Build your own**: Copy the Gantt initialization code from any section

## Common Use Cases

### Basic Gantt Chart

```vue
<script setup>
import Gantt from '../../../gantt/src/index.js'
import '../../../gantt/src/styles/gantt.css'

const ganttContainer = ref(null)

const tasks = [
  {
    id: 'task1',
    name: 'My Task',
    start: new Date(2024, 0, 1),
    end: new Date(2024, 0, 5),
    progress: 50
  }
]

onMounted(() => {
  new Gantt(ganttContainer.value, tasks)
})
</script>

<template>
  <div ref="ganttContainer"></div>
</template>
```

### With Options

```javascript
new Gantt(container, tasks, {
  view_mode: 'Week',
  bar_height: 40,
  readonly: true,
  holidays: {
    '#bfdbfe': 'weekend'
  }
})
```

## Troubleshooting

**Port already in use?**
- The dev server will automatically try the next available port
- Check the terminal output for the actual URL

**Gantt not showing?**
- Make sure the container ref is properly connected
- Check browser console for errors
- Verify CSS is imported

**Controls not working?**
- Ensure you're calling `update_options()` on the Gantt instance
- Check that refs are initialized in `onMounted()`

## Learn More

- **Full Documentation**: See `README.md`
- **Detailed Features**: See `FEATURES.md`
- **Source Code**: Explore `src/pages/index.vue`
- **Frappe Gantt Repo**: https://github.com/frappe/gantt

---

**Happy Gantt Charting!** 🎉