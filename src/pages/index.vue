<template>
  <div class="h-screen w-screen flex flex-col p-4 bg-gray-50">
    <!-- Controls -->
    <div class="mb-4 flex gap-4 items-center bg-white p-4 rounded-lg shadow">
      <div class="flex items-center gap-2">
        <label class="font-medium">Cell Width:</label>
        <input 
          v-model.number="cellWidth" 
          type="number" 
          min="20" 
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
          min="20" 
          max="200" 
          class="border rounded px-2 py-1 w-20"
        />
        <span class="text-sm text-gray-600">px</span>
      </div>
      <div class="ml-auto text-sm text-gray-600">
        Scroll to see infinite grid with positioned squares
      </div>
    </div>

    <!-- Virtual Grid Container -->
    <div 
      ref="scrollContainerRef" 
      class="flex-1 overflow-auto border-2 border-gray-300 rounded-lg bg-white relative"
      style="contain: strict;"
    >
      <div
        :style="{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: `${columnVirtualizer.getTotalSize()}px`,
          position: 'relative',
        }"
      >
        <!-- Virtual Rows -->
        <div
          v-for="virtualRow in rowVirtualizer.getVirtualItems()"
          :key="virtualRow.key"
          :style="{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: `${virtualRow.size}px`,
            transform: `translateY(${virtualRow.start}px)`,
          }"
        >
          <!-- Virtual Columns -->
          <div
            v-for="virtualColumn in columnVirtualizer.getVirtualItems()"
            :key="virtualColumn.key"
            :style="{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${virtualColumn.size}px`,
              height: '100%',
              transform: `translateX(${virtualColumn.start}px)`,
              border: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              color: '#9ca3af',
            }"
          >
            {{ virtualRow.index }}, {{ virtualColumn.index }}
          </div>
        </div>

        <!-- Colored Squares -->
        <div
          v-for="square in squares"
          :key="square.id"
          :style="{
            position: 'absolute',
            left: `${square.col * cellWidth}px`,
            top: `${square.row * cellHeight}px`,
            width: `${square.width * cellWidth}px`,
            height: `${square.height * cellHeight}px`,
            backgroundColor: square.color,
            border: '2px solid rgba(0,0,0,0.2)',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 10,
            transition: 'all 0.3s ease',
          }"
        >
          {{ square.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useVirtualizer } from '@tanstack/vue-virtual'

// Grid settings
const cellWidth = ref(80)
const cellHeight = ref(60)

// Scroll container ref
const scrollContainerRef = ref<HTMLElement | null>(null)

// Total grid size (virtually infinite)
const totalRows = 10000
const totalColumns = 10000

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
])

// Row virtualizer
const rowVirtualizer = useVirtualizer(
  computed(() => ({
    count: totalRows,
    getScrollElement: () => scrollContainerRef.value,
    estimateSize: () => cellHeight.value,
    overscan: 5,
  }))
)

// Column virtualizer
const columnVirtualizer = useVirtualizer(
  computed(() => ({
    count: totalColumns,
    getScrollElement: () => scrollContainerRef.value,
    estimateSize: () => cellWidth.value,
    horizontal: true,
    overscan: 5,
  }))
)

// Watch for cell size changes and remeasure
watchEffect(() => {
  cellWidth.value
  cellHeight.value
  rowVirtualizer.value?.measure()
  columnVirtualizer.value?.measure()
})
</script>

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
</style>