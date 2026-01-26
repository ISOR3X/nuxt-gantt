<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useVirtualizer } from '@tanstack/vue-virtual'

// Grid settings
const cellWidth = ref(10)
const cellHeight = ref(10)

// Scroll container ref
const scrollContainerRef = ref<HTMLElement | null>(null)

// Virtual grid dimensions (very large for "infinite" feel)
const totalRows = 10000
const totalColumns = 10000

// Total size in pixels
const totalWidth = computed(() => totalColumns * cellWidth.value)
const totalHeight = computed(() => totalRows * cellHeight.value)

// Generate many squares spread across the grid to demonstrate virtualization
const generateSquares = () => {
  const squares = [
    { id: 1, row: 5, col: 8, width: 3, height: 2, color: '#3b82f6', label: 'Blue Task' },
    { id: 2, row: 12, col: 15, width: 4, height: 3, color: '#ef4444', label: 'Red Task' },
    { id: 3, row: 20, col: 5, width: 2, height: 4, color: '#10b981', label: 'Green Task' },
    { id: 4, row: 8, col: 25, width: 5, height: 2, color: '#f59e0b', label: 'Orange Task' },
    { id: 5, row: 30, col: 30, width: 3, height: 3, color: '#8b5cf6', label: 'Purple Task' },
    { id: 6, row: 15, col: 40, width: 2, height: 2, color: '#ec4899', label: 'Pink Task' },
    { id: 7, row: 45, col: 20, width: 4, height: 2, color: '#14b8a6', label: 'Teal Task' },
    { id: 8, row: 50, col: 50, width: 6, height: 4, color: '#f97316', label: 'Deep Orange' },
    { id: 9, row: 100, col: 100, width: 8, height: 5, color: '#06b6d4', label: 'Cyan Task' },
    { id: 10, row: 150, col: 75, width: 3, height: 3, color: '#84cc16', label: 'Lime Task' },
  ]
  
  // Add more squares spread throughout the grid
  for (let i = 0; i < 200; i++) {
    squares.push({
      id: 100 + i,
      row: Math.floor(Math.random() * 1000) + 200,
      col: Math.floor(Math.random() * 500) + 100,
      width: Math.floor(Math.random() * 4) + 2,
      height: Math.floor(Math.random() * 2) + 1,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      label: `Task ${100 + i}`,
    })
  }
  
  return squares
}

const allSquares = ref(generateSquares())

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
const scrollLeft = computed(() => scrollContainerRef.value?.scrollLeft || 0)
const viewportWidth = computed(() => scrollContainerRef.value?.clientWidth || 1000)

// Calculate visible column range
const visibleColumnStart = computed(() => Math.floor(scrollLeft.value / cellWidth.value))
const visibleColumnEnd = computed(() => Math.ceil((scrollLeft.value + viewportWidth.value) / cellWidth.value))

// Virtualized squares - only render those in visible viewport
const visibleSquares = computed(() => {
  const virtualRows = rowVirtualizer.value.getVirtualItems()
  if (!virtualRows.length) return []
  
  const visibleRowStart = virtualRows[0].index
  const visibleRowEnd = virtualRows[virtualRows.length - 1].index
  const colStart = visibleColumnStart.value - 5 // overscan
  const colEnd = visibleColumnEnd.value + 5 // overscan
  
  return allSquares.value.filter(square => {
    const squareRowEnd = square.row + square.height
    const squareColEnd = square.col + square.width
    
    // Check if square intersects with visible area
    return !(
      square.row > visibleRowEnd ||
      squareRowEnd < visibleRowStart ||
      square.col > colEnd ||
      squareColEnd < colStart
    )
  })
})

// Grid pattern ID
const gridPatternId = 'grid-pattern'

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
        <span>Total squares: {{ allSquares.length }}</span>
        <span class="font-semibold text-blue-600">Rendered in DOM: {{ visibleSquares.length }}</span>
      </div>
    </div>

    <!-- Scroll Container -->
    <div 
      ref="scrollContainerRef" 
      class="flex-1 overflow-auto border-2 border-gray-300 rounded-lg bg-white relative"
    >
      <!-- SVG Grid Background (fixed, non-scrolling pattern definition) -->
      <svg
        :width="totalWidth"
        :height="totalHeight"
        xmlns="http://www.w3.org/2000/svg"
        class="absolute top-0 left-0 pointer-events-none"
        style="z-index: 0;"
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
        <!-- Virtualized HTML Div Squares -->
        <div
          v-for="square in visibleSquares"
          :key="square.id"
          :style="{
            position: 'absolute',
            left: `${square.col * cellWidth}px`,
            top: `${square.row * cellHeight}px`,
            width: `${square.width * cellWidth}px`,
            height: `${square.height * cellHeight}px`,
            backgroundColor: square.color,
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
          @click="() => console.log('Clicked:', square.label)"
        >
          <div class="task-content">
            <div class="task-label">{{ square.label }}</div>
            <div class="task-info" style="font-size: 10px; opacity: 0.8; margin-top: 2px;">
              Row {{ square.row }}, Col {{ square.col }}
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