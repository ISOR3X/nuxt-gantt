# Frappe Gantt Demo Features

This document provides a comprehensive overview of all features demonstrated in the `index.vue` demo page.

## Table of Contents

1. [Edit Access Control](#1-edit-access-control)
2. [Versatile Actions](#2-versatile-actions)
3. [Holiday Marking](#3-holiday-marking)
4. [Ignore Time Periods](#4-ignore-time-periods)
5. [Style Customization](#5-style-customization)
6. [Advanced Features](#6-advanced-features)

---

## 1. Edit Access Control

**Purpose**: Control what users can and cannot edit in the Gantt chart.

### Controls

- **Editable** - Master toggle for all editing capabilities
  - When disabled, the entire chart becomes read-only
  - Automatically disables both date and progress editing
- **Progress Editable** - Control progress bar editing
  - When enabled, users can drag the progress indicator within tasks
  - When disabled, progress is view-only
- **Dates Editable** - Control task date/duration editing
  - When enabled, users can drag tasks to change dates
  - When enabled, users can drag task edges to resize duration
  - When disabled, tasks cannot be moved or resized

### Use Cases

- **Project Managers**: Full editing access
- **Team Members**: Progress editing only
- **Stakeholders**: Read-only view
- **Auditors**: View-only access to historical data

### Options Used

```javascript
{
  readonly: !mutableGeneral,
  readonly_dates: !mutableDates,
  readonly_progress: !mutableProgress
}
```

---

## 2. Versatile Actions

**Purpose**: Demonstrate built-in UI controls that can be added to the Gantt chart.

### Controls

- **Scroll to Today** - Adds a "Today" button in the header
  - Automatically scrolls the timeline to show the current date
  - Useful for long-term projects spanning months or years
- **Change View Mode** - Adds a dropdown to switch between view modes
  - Options: Quarter Day, Half Day, Day, Week, Month, Year
  - Provides quick navigation between different time scales
  - Eliminates need for custom UI controls

### Use Cases

- **Quick Navigation**: Jump to current date instantly
- **Multi-scale Views**: Switch between detailed and overview perspectives
- **User Experience**: Reduce custom UI development
- **Flexibility**: Let users choose their preferred view

### Options Used

```javascript
{
  today_button: true,
  view_mode_select: true
}
```

---

## 3. Holiday Marking

**Purpose**: Highlight specific dates or date ranges with custom colors.

### Controls

- **Show Weekends** - Toggle weekend highlighting
  - Weekends are highlighted in light blue (#bfdbfe)
  - Makes it easy to distinguish work days from weekends
- **Custom Weekends** - Change which days are considered weekends
  - Default: Saturday and Sunday (standard Western calendar)
  - Alternative: Friday and Saturday (common in Middle East)
  - Can be customized to any day combination

### Features

- **Multiple Colors**: Different holiday types can have different colors
  - Green (#a3e635) for public holidays
  - Blue (#bfdbfe) for weekends
  - Any hex color can be used

- **Holiday List**: 16 Indian public holidays pre-configured
  - Republic Day, Holi, Diwali, Christmas, etc.
  - Can be replaced with any country's holidays
  - Supports any date format

### Use Cases

- **Regional Differences**: Show correct weekends for different countries
- **Public Holidays**: Highlight non-working days
- **Company Events**: Mark company-wide meetings, training days
- **Milestones**: Highlight important project dates
- **Custom Calendars**: Support different cultural or religious calendars

### Options Used

```javascript
{
  holidays: {
    '#a3e635': HOLIDAYS,      // Green for holidays
    '#bfdbfe': 'weekend'      // Blue for weekends
  },
  is_weekend: (d) => d.getDay() === 6 || d.getDay() === 5  // Custom weekend
}
```

---

## 4. Ignore Time Periods

**Purpose**: Completely remove specific dates from the timeline calculations.

### How It Works

Unlike holiday marking (which only highlights dates), the `ignore` option completely removes dates from the timeline:

- Tasks skip over ignored dates when calculating duration
- Ignored dates don't appear in the timeline grid
- Dependencies and date calculations exclude ignored periods
- The timeline becomes compressed, showing only "working" dates

### Controls

- **Ignore Weekends** - Remove weekends from timeline
  - 5-day work week instead of 7-day calendar week
  - Tasks automatically extend to account for skipped days
  - More accurate representation of actual work time

### Use Cases

- **Work Schedules**: Show only business days (Mon-Fri)
- **Custom Calendars**: Remove company closure periods
- **Accurate Planning**: Calculate work days vs calendar days
- **Resource Planning**: Show when team members are actually available
- **Seasonal Work**: Ignore off-season periods

### Example

If a task is scheduled for 5 days starting Monday:

- **Without ignore**: Task spans Mon-Fri
- **With ignore weekends**: Task still spans Mon-Fri (same result)

But if scheduled for 10 days starting Monday:

- **Without ignore**: Task ends Wednesday next week (includes Sat-Sun)
- **With ignore weekends**: Task ends Friday next week (skips weekends)

### Options Used

```javascript
{
  ignore: ["weekend", ...HOLIDAYS.map((k) => k.date)];
}
```

---

## 5. Style Customization

**Purpose**: Provide complete control over the visual appearance of the Gantt chart.

### Grid Controls

- **Grid Height** (150-600px)
  - Total height of the chart container
  - Affects how many tasks are visible without scrolling
  - Useful for fitting charts into specific layouts

- **Padding** (3-50px)
  - Space between task bars and grid lines
  - Affects visual density
  - Higher values = more breathing room

- **Column Width** (30-70px)
  - Width of each time period column
  - Affects horizontal spacing
  - Wider columns = more space for task names

### Bar Controls

- **Height** (10-100px)
  - Height of individual task bars
  - Affects readability and density
  - Taller bars are easier to click but show fewer tasks

- **Radius** (1-50px)
  - Corner radius of task bars
  - Affects visual style (sharp vs rounded)
  - Higher values = more rounded appearance

- **Arrow Curve** (1-50px)
  - Curvature of dependency arrows
  - Affects visual style and clarity
  - Higher values = more curved arrows

### Use Cases

- **Corporate Branding**: Match company design guidelines
- **Accessibility**: Increase sizes for better visibility
- **Information Density**: Adjust spacing based on data volume
- **Screen Size**: Optimize for different display resolutions
- **Print Layouts**: Adjust for printed reports
- **User Preferences**: Let users customize their view

### Real-time Updates

All style changes take effect immediately without losing:

- Current scroll position
- Selected tasks
- Expanded/collapsed states

### Options Used

```javascript
{
  container_height: gridHeight,
  padding: padding,
  column_width: columnWidth,
  bar_height: barHeight,
  bar_corner_radius: barRadius,
  arrow_curve: arrowCurve
}
```

---

## 6. Advanced Features

**Purpose**: Fine-grained control over behavior and interactions.

### Snap Controls

**Snap By**: Define how tasks snap to the grid when dragged

- **Quantity** (1-999): Number of time units
- **Scale**: Type of time unit
  - Second (s)
  - Minute (min)
  - Hour (h)
  - Day (d)
  - Month (m)
  - Year (y)

**Examples**:

- `1d` = Snap to 1-day increments (default)
- `2h` = Snap to 2-hour increments
- `30min` = Snap to 30-minute increments
- `1m` = Snap to 1-month increments

**Use Cases**:

- **Hourly Planning**: Construction projects with hourly tasks
- **Sprint Planning**: Snap to week boundaries
- **Long-term Strategy**: Snap to quarters or months
- **Precision Work**: Snap to minutes for detailed schedules

### Auto-moving Label

Controls whether task labels automatically reposition:

- **Enabled** (default): Labels move outside the bar if they don't fit
- **Disabled**: Labels stay in fixed position (may overlap or clip)

**Use Cases**:

- **Short Tasks**: Prevent labels from appearing outside bars
- **Consistent Layout**: Keep labels in predictable positions
- **Print Layouts**: Ensure labels don't break page boundaries

### Options Used

```javascript
{
  snap_at: snapAtQty + snapAtScale,  // e.g., '1d', '2h', '30min'
  auto_move_label: autoMoveLabel
}
```

---

## Technical Implementation

### State Management

All controls use Vue 3 `ref()` for reactive state:

```javascript
const mutableGeneral = ref(true);
const gridHeight = ref(300);
const snapAtQty = ref(1);
```

### Update Pattern

Each section has an update function that:

1. Preserves scroll position
2. Updates options
3. Restores scroll position

```javascript
const updateStyling = () => {
  if (stylingGantt) {
    const scrollLeft = stylingGantt.$container?.scrollLeft || 0;
    stylingGantt.update_options({
      bar_height: barHeight.value,
      scroll_to: null,
    });
    if (stylingGantt.$container) {
      stylingGantt.$container.scrollLeft = scrollLeft;
    }
  }
};
```

### Multiple Instances

The demo uses 6 separate Gantt instances to showcase different features:

- `mutabilityGantt` - Edit controls
- `sideheaderGantt` - Built-in UI
- `holidaysGantt` - Holiday marking
- `ignoreGantt` - Ignoring dates
- `stylingGantt` - Visual customization
- `advancedGantt` - Advanced options

---

## Best Practices

### Performance

- Use `scroll_to: null` when updating options to prevent unwanted scrolling
- Manually preserve and restore scroll position for better UX
- Debounce slider inputs if performance becomes an issue

### User Experience

- Group related controls together
- Provide visual feedback for all interactions
- Show current values for range inputs
- Use descriptive labels and help text

### Accessibility

- Use semantic HTML (labels, inputs)
- Ensure keyboard navigation works
- Provide adequate contrast
- Support screen readers

### Customization

- Start with sensible defaults
- Allow users to save preferences
- Provide reset functionality
- Document all available options

---

## Sample Data

### Simple Tasks (4 tasks)

Used in mutability and ignore sections - basic workflow demonstration.

### Spread Tasks (4 tasks)

Used in sideheader and holidays sections - tasks spread over longer timeline.

### Many Tasks (10 tasks)

Used in styling section - shows how chart handles more data.

### Holidays (16 dates)

Indian public holidays throughout 2024 - demonstrates holiday marking.

---

## Browser Compatibility

All features work in modern browsers:

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

### CSS Features Used

- CSS Grid
- CSS Custom Properties
- Flexbox
- Modern selectors

### JavaScript Features Used

- ES6 Modules
- Arrow Functions
- Destructuring
- Template Literals
- Optional Chaining

---

## Further Reading

- [Frappe Gantt Documentation](https://github.com/frappe/gantt)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Project Management Best Practices](https://www.pmi.org/)

---

**Last Updated**: 2024
**Demo Version**: 1.0.0
**Frappe Gantt Version**: 1.0.4
