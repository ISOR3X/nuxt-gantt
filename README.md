# Nuxt Gantt

Gantt charts for Nuxt UI.

A work in progress project for creating gantt charts.

## Features

1. 2D virtualization: Both the grid and tasks are virtualized, meaning in theory you can have an infinite number of tasks for a project of an infinite duration. Every project managers' dream!
2. Deadlines
3. Save and load projects to JSON

## To do

- [ ] Convert col index to `Temporal.PlainDate` during serialization and vice versa.
- [ ] Dependency arrows.
- [ ] Task editing GUI.
- [ ] Make the project into a library and publish on NPM.

This library was inspired by the Gantt chart found in MS Planner, [Umay Gantt Chart builder](https://github.com/aligundogdu/Umay-Gantt-Chart-Builder) and of course Nuxt UI itself for creating stylable components.

Not affiliated with Nuxt in any way.
