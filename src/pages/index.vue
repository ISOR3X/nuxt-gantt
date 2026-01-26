<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useVirtualizer } from '@tanstack/vue-virtual'

// Grid settings
const cellWidth = ref(30)
const cellHeight = ref(30)

// Scroll container ref
const scrollContainerRef = ref<HTMLElement | null>(null)
const headerHeight = 40 // Height of the header in pixels

// Virtual grid dimensions (very large for "infinite" feel)
const totalRows = 10000
const totalColumns = 10000

// Total size in pixels
const totalWidth = computed(() => totalColumns * cellWidth.value)
const totalHeight = computed(() => totalRows * cellHeight.value)

// Task interface
interface Task {
  id: number
  row: number
  col: number
  width: number
  height: number
  color: string
  label: string
}

// Generate random task for a specific row (one task per row)
const generateRandomTask = (rowIndex: number): Task => {
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
    '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
  ]
  
  return {
    id: rowIndex,
    row: rowIndex,
    col: Math.floor(Math.random() * 50) + 5, // Start between columns 5-55
    width: Math.floor(Math.random() * 15) + 5, // Width between 5-20 cells
    height: 1, // One row height (standard Gantt task)
    color: colors[rowIndex % colors.length],
    label: `Task ${rowIndex}`,
  }
}

// Generate tasks for all rows (one task per row)
const generateAllTasks = (): Task[] => {
  const tasks: Task[] = []
  for (let i = 0; i < totalRows; i++) {
    tasks.push(generateRandomTask(i))
  }
  return tasks
}

const allTasks = ref(generateAllTasks())

// Row virtualizer - properly using TanStack Virtual
const rowVirtualizer = useVirtualizer(
  computed(() => ({
    count: totalRows,
    getScrollElement: () => scrollContainerRef.value,
    estimateSize: () => cellHeight.value,
    overscan: 3,
  }))
)

// Get current scroll position for horizontal virtualization
const scrollLeft = ref(0)
const viewportWidth = computed(() => scrollContainerRef.value?.clientWidth || 1000)

// Update scroll position on scroll event
const handleScroll = () => {
  if (scrollContainerRef.value) {
    scrollLeft.value = scrollContainerRef.value.scrollLeft
  }
}

// Setup and cleanup scroll listener
onMounted(() => {
  if (scrollContainerRef.value) {
    scrollContainerRef.value.addEventListener('scroll', handleScroll)
    handleScroll() // Initial update
  }
})

onUnmounted(() => {
  if (scrollContainerRef.value) {
    scrollContainerRef.value.removeEventListener('scroll', handleScroll)
  }
})

// Calculate visible column range
const visibleColumnStart = computed(() => Math.floor(scrollLeft.value / cellWidth.value))
const visibleColumnEnd = computed(() => Math.ceil((scrollLeft.value + viewportWidth.value) / cellWidth.value))

// Virtualized tasks - only render those in visible viewport
const visibleTasks = computed(() => {
  const virtualRows = rowVirtualizer.value.getVirtualItems()
  if (!virtualRows.length) return []
  
  const visibleRowStart = virtualRows[0].index
  const visibleRowEnd = virtualRows[virtualRows.length - 1].index
  const colStart = visibleColumnStart.value - 5 // overscan
  const colEnd = visibleColumnEnd.value + 5 // overscan
  
  return allTasks.value.filter(task => {
    const taskColEnd = task.col + task.width
    
    // Check if task intersects with visible area
    // Since each task is exactly on its row, we just check row range and column range
    return (
      task.row >= visibleRowStart &&
      task.row <= visibleRowEnd &&
      !(task.col > colEnd || taskColEnd < colStart)
    )
  })
})

// Grid pattern ID
const gridPatternId = 'grid-pattern'

// Generate column headers based on visible columns
const visibleColumns = computed(() => {
  const columns = []
  const startCol = Math.max(0, visibleColumnStart.value - 5) // Add overscan
  const endCol = Math.min(totalColumns, visibleColumnEnd.value + 5)
  
  for (let i = startCol; i < endCol; i++) {
    columns.push({
      index: i,
      label: `Col ${i}`,
      left: i * cellWidth.value,
    })
  }
  
  return columns
})

// Watch for cell size changes and remeasure
watch([cellWidth, cellHeight], () => {
  rowVirtualizer.value?.measure()
})
</script>

<template>
  <div class="h-screen w-screen flex flex-col p-4 bg-gray-50">
    <!-- Controls -->
    <div class="mb-4 flex gap-4 items-center bg-white p-4 rounded-lg shadow">
      <div class="flex items-center gap-2">
        <label class="font-medium">Cell Width:</label>
        <input 
          v-model.number="cellWidth" 
          type="number" 
          min="10" 
          max="200" 
          class="border rounded px-2 py-1 w-20"
        />
        <span class="text-sm text-gray-600">px</span>
      </div>
      <div class="flex items-center gap-2">
        <label class="font-medium">Cell Height:</label>
        <input 
          v-model.number="cellHeight" 
          type="number" 
          min="10" 
          max="200" 
          class="border rounded px-2 py-1 w-20"
        />
        <span class="text-sm text-gray-600">px</span>
      </div>
      <div class="ml-auto flex gap-4 text-sm text-gray-600">
        <span>Total tasks: {{ allTasks.length }}</span>
        <span class="font-semibold text-blue-600">Rendered in DOM: {{ visibleTasks.length }}</span>
      </div>
    </div>

    <!-- Scroll Container -->
    <div 
      ref="scrollContainerRef" 
      class="flex-1 overflow-auto border-2 border-gray-300 rounded-lg bg-white relative"
    >
      <!-- Sticky Header Row -->
      <div 
        class="sticky-header"
        :style="{
          position: 'sticky',
          top: 0,
          left: 0,
          height: `${headerHeight}px`,
          width: '100%',
          zIndex: 100,
          backgroundColor: '#f9fafb',
          borderBottom: '2px solid #d1d5db',
          overflow: 'hidden',
        }"
      >
        <!-- Header content container (moves with scroll) -->
        <div
          :style="{
            position: 'relative',
            width: `${totalWidth}px`,
            height: '100%',
            transform: `translateX(-${scrollLeft}px)`,
          }"
        >
          <!-- Virtualized column headers -->
          <div
            v-for="col in visibleColumns"
            :key="col.index"
            :style="{
              position: 'absolute',
              left: `${col.left}px`,
              top: 0,
              width: `${cellWidth}px`,
              height: `${headerHeight}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '600',
              color: '#374151',
              borderRight: '1px solid #e5e7eb',
              userSelect: 'none',
            }"
          >
            {{ col.label }}
          </div>
        </div>
      </div>
      <!-- SVG Grid Background (offset by header height) -->
      <svg
        :width="totalWidth"
        :height="totalHeight"
        xmlns="http://www.w3.org/2000/svg"
        class="absolute pointer-events-none"
        :style="{
          top: `${headerHeight}px`,
          left: 0,
          zIndex: 0,
        }"
      >
        <defs>
          <pattern
            :id="gridPatternId"
            :width="cellWidth"
            :height="cellHeight"
            patternUnits="userSpaceOnUse"
          >
            <rect 
              :width="cellWidth" 
              :height="cellHeight" 
              fill="white"
            />
            <path
              :d="`M ${cellWidth} 0 L 0 0 0 ${cellHeight}`"
              fill="none"
              stroke="#e5e7eb"
              stroke-width="1"
            />
          </pattern>
        </defs>

        <rect
          :width="totalWidth"
          :height="totalHeight"
          :fill="`url(#${gridPatternId})`"
        />
      </svg>

      <!-- HTML Div Container for Tasks/Squares -->
      <div
        :style="{
          position: 'relative',
          width: `${totalWidth}px`,
          height: `${totalHeight}px`,
          zIndex: 1,
        }"
      >
        <!-- Virtualized HTML Div Tasks (one per row) -->
        <div
          v-for="task in visibleTasks"
          :key="task.id"
          :style="{
            position: 'absolute',
            left: `${task.col * cellWidth}px`,
            top: `${task.row * cellHeight}px`,
            width: `${task.width * cellWidth}px`,
            height: `${task.height * cellHeight}px`,
            backgroundColor: task.color,
            borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            padding: '8px',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '12px',
            border: '2px solid rgba(255,255,255,0.3)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }"
          class="task-item"
          @click="() => console.log('Clicked:', task.label)"
        >
          <div class="task-content">
            <div class="task-label">{{ task.label }}</div>
            <div class="task-info" style="font-size: 10px; opacity: 0.8; margin-top: 2px;">
              Row {{ task.row }} | Col {{ task.col }}-{{ task.col + task.width }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Info Panel -->
    <div class="mt-4 bg-white p-3 rounded-lg shadow text-sm text-gray-600">
      <div class="flex gap-6">
        <span>✓ SVG grid background for performance</span>
        <span>✓ HTML divs for task customization</span>
        <span>✓ TanStack Virtual row virtualization</span>
        <span>✓ Manual column virtualization</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar styling */
div::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

div::-webkit-scrollbar-track {
  background: #f1f1f1;
}

div::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 6px;
}

div::-webkit-scrollbar-thumb:hover {
  background: #555;
}

input[type="number"] {
  border: 1px solid #d1d5db;
}

input[type="number"]:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.task-item:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
  z-index: 10;
}

.task-content {
  text-align: center;
  width: 100%;
}

.task-label {
  font-weight: 600;
}

.task-info {
  font-size: 10px;
  opacity: 0.9;
}
</style>