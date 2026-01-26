<script setup lang="ts">
import { ref, computed } from 'vue'
import { useVirtualizer } from '@tanstack/vue-virtual'

// Grid settings
const cellWidth = ref(10)
const cellHeight = ref(10)

// Scroll container ref
const scrollContainerRef = ref<HTMLElement | null>(null)

// Virtual grid dimensions (very large for "infinite" feel)
const totalRows = 100000
const totalColumns = 100000

// Total size in pixels
const totalWidth = computed(() => totalColumns * cellWidth.value)
const totalHeight = computed(() => totalRows * cellHeight.value)

// Colored squares to display on the grid
const squares = ref([
  { id: 1, row: 5, col: 8, width: 3, height: 2, color: '#3b82f6', label: 'Blue' },
  { id: 2, row: 12, col: 15, width: 4, height: 3, color: '#ef4444', label: 'Red' },
  { id: 3, row: 20, col: 5, width: 2, height: 4, color: '#10b981', label: 'Green' },
  { id: 4, row: 8, col: 25, width: 5, height: 2, color: '#f59e0b', label: 'Orange' },
  { id: 5, row: 30, col: 30, width: 3, height: 3, color: '#8b5cf6', label: 'Purple' },
  { id: 6, row: 15, col: 40, width: 2, height: 2, color: '#ec4899', label: 'Pink' },
  { id: 7, row: 45, col: 20, width: 4, height: 2, color: '#14b8a6', label: 'Teal' },
  { id: 8, row: 50, col: 50, width: 6, height: 4, color: '#f97316', label: 'Deep Orange' },
  { id: 9, row: 100, col: 100, width: 8, height: 5, color: '#06b6d4', label: 'Cyan' },
  { id: 10, row: 150, col: 75, width: 3, height: 3, color: '#84cc16', label: 'Lime' },
])

// Virtualizer for tracking scroll position
const virtualizer = useVirtualizer(
  computed(() => ({
    count: 1,
    getScrollElement: () => scrollContainerRef.value,
    estimateSize: () => totalHeight.value,
    overscan: 0,
  }))
)

// Get current scroll position
const scrollTop = computed(() => scrollContainerRef.value?.scrollTop || 0)
const scrollLeft = computed(() => scrollContainerRef.value?.scrollLeft || 0)

// Calculate visible viewport bounds
const viewportWidth = computed(() => scrollContainerRef.value?.clientWidth || 1000)
const viewportHeight = computed(() => scrollContainerRef.value?.clientHeight || 1000)

// Calculate which squares are visible (with overscan buffer)
const overscanPixels = 500 // pixels of overscan on each side
const visibleSquares = computed(() => {
  const top = scrollTop.value - overscanPixels
  const left = scrollLeft.value - overscanPixels
  const bottom = scrollTop.value + viewportHeight.value + overscanPixels
  const right = scrollLeft.value + viewportWidth.value + overscanPixels

  return squares.value.filter(square => {
    const squareLeft = square.col * cellWidth.value
    const squareTop = square.row * cellHeight.value
    const squareRight = squareLeft + square.width * cellWidth.value
    const squareBottom = squareTop + square.height * cellHeight.value

    // Check if square intersects with visible area
    return !(squareRight < left || squareLeft > right || squareBottom < top || squareTop > bottom)
  })
})

// Grid pattern ID
const gridPatternId = 'grid-pattern'

// SVG viewBox (we'll keep it simple and use scroll container)
const svgWidth = computed(() => totalWidth.value)
const svgHeight = computed(() => totalHeight.value)
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
          min="5" 
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
          min="5" 
          max="200" 
          class="border rounded px-2 py-1 w-20"
        />
        <span class="text-sm text-gray-600">px</span>
      </div>
      <div class="ml-auto text-sm text-gray-600">
        Visible squares: {{ visibleSquares.length }} / {{ squares.length }}
      </div>
    </div>

    <!-- Scroll Container with SVG Grid -->
    <div 
      ref="scrollContainerRef" 
      class="flex-1 overflow-auto border-2 border-gray-300 rounded-lg bg-white relative"
    >
      <svg
        :width="svgWidth"
        :height="svgHeight"
        xmlns="http://www.w3.org/2000/svg"
        class="block"
      >
        <!-- Define the grid pattern -->
        <defs>
          <pattern
            :id="gridPatternId"
            :width="cellWidth"
            :height="cellHeight"
            patternUnits="userSpaceOnUse"
          >
            <!-- Grid cell background -->
            <rect 
              :width="cellWidth" 
              :height="cellHeight" 
              fill="white"
            />
            <!-- Grid lines -->
            <path
              :d="`M ${cellWidth} 0 L 0 0 0 ${cellHeight}`"
              fill="none"
              stroke="#e5e7eb"
              stroke-width="1"
            />
          </pattern>
        </defs>

        <!-- Grid background using pattern -->
        <rect
          :width="svgWidth"
          :height="svgHeight"
          :fill="`url(#${gridPatternId})`"
        />

        <!-- Only render visible squares (virtualized) -->
        <g v-for="square in visibleSquares" :key="square.id">
          <!-- Square background -->
          <rect
            :x="square.col * cellWidth"
            :y="square.row * cellHeight"
            :width="square.width * cellWidth"
            :height="square.height * cellHeight"
            :fill="square.color"
            stroke="rgba(0,0,0,0.2)"
            stroke-width="2"
            rx="4"
            class="square-element"
          />
          <!-- Square label -->
          <text
            :x="square.col * cellWidth + (square.width * cellWidth) / 2"
            :y="square.row * cellHeight + (square.height * cellHeight) / 2"
            text-anchor="middle"
            dominant-baseline="middle"
            fill="white"
            font-weight="bold"
            font-size="14"
            class="pointer-events-none select-none"
          >
            {{ square.label }}
          </text>
        </g>

        <!-- Grid coordinate labels (sparse sampling for performance) -->
        <g v-if="cellWidth >= 30 && cellHeight >= 30">
          <text
            v-for="i in Math.min(20, Math.floor(viewportWidth / cellWidth))"
            :key="`col-${i}`"
            :x="(Math.floor(scrollLeft / cellWidth) + i) * cellWidth + cellWidth / 2"
            :y="scrollTop + 12"
            text-anchor="middle"
            fill="#9ca3af"
            font-size="10"
            class="pointer-events-none select-none"
          >
            {{ Math.floor(scrollLeft / cellWidth) + i }}
          </text>
          <text
            v-for="i in Math.min(20, Math.floor(viewportHeight / cellHeight))"
            :key="`row-${i}`"
            :x="scrollLeft + 12"
            :y="(Math.floor(scrollTop / cellHeight) + i) * cellHeight + cellHeight / 2"
            dominant-baseline="middle"
            fill="#9ca3af"
            font-size="10"
            class="pointer-events-none select-none"
          >
            {{ Math.floor(scrollTop / cellHeight) + i }}
          </text>
        </g>
      </svg>
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

.square-element {
  transition: opacity 0.2s ease;
  cursor: pointer;
}

.square-element:hover {
  opacity: 0.8;
}
</style>