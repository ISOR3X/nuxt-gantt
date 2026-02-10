# Nuxt Gantt

Gantt charts for Nuxt UI.

A work in progress project for creating gantt charts.

## Features

1. 2D virtualization: Both the grid and tasks are virtualized, meaning in theory you can have an infinite number of tasks for a project of an infinite duration. Every project managers' dream!
2. Deadlines
3. Task dependencies with arrows
4. Save and load projects to JSON

## To do

- [x] Convert col index to `Temporal.PlainDate` during serialization and vice versa.
- [x] Task dependencie with dependency arrows.
- [x] Task editing GUI.
- [x] Split code of GanttChart.vue. It has become difficult to read. Composables such as `createGantt`, `useGantt` could be ideas?
- [x] Remove two sources of truth for Tasks; date and column index.
- [ ] Change date format on small cell sizes
- [ ] Add export to pdf option (scale to fit page)
- [ ] Implement styling system similar to Nuxt UI
- [ ] Generalize Gantt objects; Tasks, deadlines, events, etc.
- [ ] Make the project into a library and publish on NPM.

This library was inspired by the Gantt chart found in MS Planner, [Umay Gantt Chart builder](https://github.com/aligundogdu/Umay-Gantt-Chart-Builder) and of course Nuxt UI itself for creating stylable components.

Not affiliated with Nuxt in any way.
