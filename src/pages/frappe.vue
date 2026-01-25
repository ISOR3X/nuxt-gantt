<script setup lang="ts">
import { ref, onMounted } from "vue";
import Gantt from "../../../gantt/src/index.js";
import "../../../gantt/src/styles/gantt.css";

// Refs for all Gantt containers
const mutabilityContainer = ref<HTMLElement | null>(null);
const sideheaderContainer = ref<HTMLElement | null>(null);
const holidaysContainer = ref<HTMLElement | null>(null);
const ignoreContainer = ref<HTMLElement | null>(null);
const stylingContainer = ref<HTMLElement | null>(null);
const advancedContainer = ref<HTMLElement | null>(null);

// Gantt instances
let mutabilityGantt: any = null;
let sideheaderGantt: any = null;
let holidaysGantt: any = null;
let ignoreGantt: any = null;
let stylingGantt: any = null;
let advancedGantt: any = null;

// Control states
const mutableGeneral = ref(true);
const mutableDates = ref(true);
const mutableProgress = ref(true);
const toggleToday = ref(true);
const toggleViewMode = ref(true);
const toggleWeekends = ref(false);
const customWeekends = ref(false);
const ignoreWeekends = ref(true);
const autoMoveLabel = ref(false);

// Styling controls
const gridHeight = ref(300);
const padding = ref(18);
const columnWidth = ref(30);
const barHeight = ref(30);
const barRadius = ref(3);
const arrowCurve = ref(5);

// Snap controls
const snapAtQty = ref(1);
const snapAtScale = ref("d");

// Helper function to get dates relative to today
const getDate = (daysFromToday: number) => {
  const rawToday = new Date();
  const today =
    Date.UTC(rawToday.getFullYear(), rawToday.getMonth(), rawToday.getDate()) +
    new Date().getTimezoneOffset() * 60000;
  return new Date(today + daysFromToday * 86400000);
};

const random = (begin = 10, end = 90, multiple = 10) => {
  let k: number;
  do {
    k = Math.floor(Math.random() * 100);
  } while (k < begin || k > end || k % multiple !== 0);
  return k;
};

// Sample tasks
const tasks = [
  {
    start: getDate(-2),
    end: getDate(2),
    name: "Redesign website",
    id: "Task 0",
    progress: random(),
  },
  {
    start: getDate(3),
    duration: "6d",
    name: "Write new content",
    id: "Task 1",
    progress: random(),
    important: true,
    dependencies: "Task 0",
  },
  {
    start: getDate(4),
    duration: "2d",
    name: "Apply new styles",
    id: "Task 2",
    progress: random(),
  },
  {
    start: getDate(-4),
    end: getDate(0),
    name: "Review",
    id: "Task 3",
    progress: random(),
  },
];

const tasksSpread = [
  {
    start: getDate(-30),
    end: getDate(-10),
    name: "Redesign website",
    id: "Task 0",
    progress: random(),
  },
  {
    start: getDate(-15),
    duration: "21d",
    name: "Write new content",
    id: "Task 1",
    progress: random(),
    important: true,
  },
  {
    start: getDate(10),
    duration: "14d",
    name: "Review",
    id: "Task 3",
    progress: random(),
  },
  {
    start: getDate(-3),
    duration: "4d",
    name: "Publish",
    id: "Task 4",
    progress: random(),
  },
];

const tasksMany = [
  {
    start: getDate(-30),
    end: getDate(-10),
    name: "Redesign website",
    id: "Task 0",
    progress: random(),
  },
  {
    start: getDate(-15),
    end: getDate(-10),
    name: "Write new content",
    id: "Task 1",
    progress: random(),
    dependencies: "Task 0",
  },
  {
    start: getDate(10),
    duration: "14d",
    name: "Apply new styles",
    id: "Task 2",
    progress: random(),
    important: true,
  },
  {
    start: getDate(-3),
    duration: "4d",
    name: "Review",
    dependencies: "Task 2",
    id: "Task 3",
    progress: random(),
  },
  {
    start: getDate(-3),
    duration: "7d",
    name: "Review 2",
    dependencies: "Task 2",
    id: "Task 4",
    progress: random(),
    important: true,
  },
  {
    start: getDate(-20),
    end: getDate(-10),
    name: "First milestone",
    id: "Task 5",
    progress: random(),
  },
  {
    start: getDate(-10),
    duration: "5d",
    name: "Second milestone",
    id: "Task 6",
    progress: random(),
  },
  {
    start: getDate(-5),
    end: getDate(0),
    name: "Third milestone",
    id: "Task 7",
    progress: random(),
    important: true,
  },
  {
    start: getDate(1),
    duration: "7d",
    name: "Fourth milestone",
    id: "Task 8",
    progress: random(),
  },
  {
    start: getDate(8),
    duration: "14d",
    name: "Final milestone",
    id: "Task 9",
    progress: random(),
    important: true,
  },
];

const HOLIDAYS = [
  { name: "Republic Day", date: "2024-01-26" },
  { name: "Maha Shivratri", date: "2024-02-23" },
  { name: "Holi", date: "2024-03-11" },
  { name: "Mahavir Jayanthi", date: "2024-04-07" },
  { name: "Good Friday", date: "2024-04-10" },
  { name: "May Day", date: "2024-05-01" },
  { name: "Buddha Purnima", date: "2024-05-08" },
  { name: "Krishna Janmastami", date: "2024-08-14" },
  { name: "Independence Day", date: "2024-08-15" },
  { name: "Ganesh Chaturthi", date: "2024-08-23" },
  { name: "Id-Ul-Fitr", date: "2024-09-21" },
  { name: "Vijaya Dashami", date: "2024-09-28" },
  { name: "Mahatma Gandhi Jayanti", date: "2024-10-02" },
  { name: "Diwali", date: "2024-10-17" },
  { name: "Guru Nanak Jayanthi", date: "2024-11-02" },
  { name: "Christmas", date: "2024-12-25" },
];

// Update functions for each gantt instance
const updateMutability = () => {
  if (mutabilityGantt) {
    const scrollLeft = mutabilityGantt.$container?.scrollLeft || 0;
    mutabilityGantt.update_options({
      readonly: !mutableGeneral.value,
      readonly_dates: !mutableDates.value,
      readonly_progress: !mutableProgress.value,
      scroll_to: null,
    });
    if (mutabilityGantt.$container) {
      mutabilityGantt.$container.scrollLeft = scrollLeft;
    }
  }
};

const updateSideheader = () => {
  if (sideheaderGantt) {
    const scrollLeft = sideheaderGantt.$container?.scrollLeft || 0;
    sideheaderGantt.update_options({
      today_button: toggleToday.value,
      view_mode_select: toggleViewMode.value,
      scroll_to: null,
    });
    if (sideheaderGantt.$container) {
      sideheaderGantt.$container.scrollLeft = scrollLeft;
    }
  }
};

const updateHolidays = () => {
  if (holidaysGantt) {
    const scrollLeft = holidaysGantt.$container?.scrollLeft || 0;
    holidaysGantt.update_options({
      holidays: {
        "#a3e635": HOLIDAYS,
        "#bfdbfe": toggleWeekends.value ? "weekend" : [],
      },
      is_weekend: customWeekends.value
        ? (d: Date) => d.getDay() === 6 || d.getDay() === 5
        : (d: Date) => d.getDay() === 0 || d.getDay() === 6,
      scroll_to: null,
    });
    if (holidaysGantt.$container) {
      holidaysGantt.$container.scrollLeft = scrollLeft;
    }
  }
};

const updateIgnore = () => {
  if (ignoreGantt) {
    const scrollLeft = ignoreGantt.$container?.scrollLeft || 0;
    ignoreGantt.update_options({
      ignore: ignoreWeekends.value ? ["weekend"] : [],
      scroll_to: null,
    });
    if (ignoreGantt.$container) {
      ignoreGantt.$container.scrollLeft = scrollLeft;
    }
  }
};

const updateStyling = () => {
  if (stylingGantt) {
    const scrollLeft = stylingGantt.$container?.scrollLeft || 0;
    stylingGantt.update_options({
      container_height: gridHeight.value,
      padding: padding.value,
      column_width: columnWidth.value,
      bar_height: barHeight.value,
      bar_corner_radius: barRadius.value,
      arrow_curve: arrowCurve.value,
      scroll_to: null,
    });
    if (stylingGantt.$container) {
      stylingGantt.$container.scrollLeft = scrollLeft;
    }
  }
};

const updateAdvanced = () => {
  if (advancedGantt) {
    const scrollLeft = advancedGantt.$container?.scrollLeft || 0;
    advancedGantt.update_options({
      auto_move_label: autoMoveLabel.value,
      snap_at: snapAtQty.value + snapAtScale.value,
      scroll_to: null,
    });
    if (advancedGantt.$container) {
      advancedGantt.$container.scrollLeft = scrollLeft;
    }
  }
};

// Watch for general mutability change
const onMutableGeneralChange = () => {
  if (!mutableGeneral.value) {
    mutableDates.value = false;
    mutableProgress.value = false;
  } else {
    mutableDates.value = true;
    mutableProgress.value = true;
  }
  updateMutability();
};

onMounted(() => {
  // Initialize all Gantt instances
  if (mutabilityContainer.value) {
    mutabilityGantt = new Gantt(mutabilityContainer.value, tasks);
  }

  if (sideheaderContainer.value) {
    sideheaderGantt = new Gantt(sideheaderContainer.value, tasksSpread, {
      today_button: true,
      view_mode_select: true,
      holidays: null,
    });
  }

  if (holidaysContainer.value) {
    holidaysGantt = new Gantt(holidaysContainer.value, tasksSpread, {
      holidays: {
        "#bfdbfe": [],
        "#a3e635": HOLIDAYS,
      },
    });
  }

  if (ignoreContainer.value) {
    ignoreGantt = new Gantt(ignoreContainer.value, tasks, {
      ignore: ["weekend", ...HOLIDAYS.map((k) => k.date)],
      holidays: null,
      scroll_to: getDate(-10),
    });
  }

  if (stylingContainer.value) {
    stylingGantt = new Gantt(stylingContainer.value, tasksMany, {
      holidays: null,
      scroll_to: getDate(-10),
    });
  }

  if (advancedContainer.value) {
    advancedGantt = new Gantt(advancedContainer.value, tasksSpread, {
      holidays: null,
      view_mode_select: true,
      snap_at: "1d",
      auto_move_label: false,
      scroll_to: "today",
    });
  }
});
</script>

<template>
  <div class="gantt-demo">
    <div class="header">
      <h1>Frappe Gantt</h1>
      <p class="subtitle">Interactive project timeline with comprehensive controls</p>
    </div>

    <!-- Mutability Section -->
    <section class="demo-section">
      <div class="section-content">
        <div class="controls-panel">
          <h3>Set edit access</h3>
          <p>Easy make sure your employees change <em>only</em> what they need to.</p>

          <div class="switch-group">
            <label class="switch-label">
              <input
                v-model="mutableGeneral"
                type="checkbox"
                class="switch-input"
                @change="onMutableGeneralChange"
              />
              <span class="switch-slider"></span>
              <span class="switch-text">Editable</span>
            </label>
          </div>

          <div class="switch-group">
            <label class="switch-label">
              <input
                v-model="mutableProgress"
                type="checkbox"
                class="switch-input"
                @change="updateMutability"
              />
              <span class="switch-slider"></span>
              <span class="switch-text">Progress editable</span>
            </label>
          </div>

          <div class="switch-group">
            <label class="switch-label">
              <input
                v-model="mutableDates"
                type="checkbox"
                class="switch-input"
                @change="updateMutability"
              />
              <span class="switch-slider"></span>
              <span class="switch-text">Dates editable</span>
            </label>
          </div>
        </div>

        <div class="gantt-panel">
          <div ref="mutabilityContainer" class="gantt-container"></div>
        </div>
      </div>
    </section>

    <!-- Sideheader Section -->
    <section class="demo-section reverse">
      <div class="section-content">
        <div class="gantt-panel">
          <div ref="sideheaderContainer" class="gantt-container"></div>
        </div>

        <div class="controls-panel">
          <h3>Versatile Actions</h3>
          <p>Change the view mode, or scroll to today, or add anything you like.</p>

          <div class="switch-group">
            <label class="switch-label">
              <input
                v-model="toggleToday"
                type="checkbox"
                class="switch-input"
                @change="updateSideheader"
              />
              <span class="switch-slider"></span>
              <span class="switch-text">Scroll to Today</span>
            </label>
          </div>

          <div class="switch-group">
            <label class="switch-label">
              <input
                v-model="toggleViewMode"
                type="checkbox"
                class="switch-input"
                @change="updateSideheader"
              />
              <span class="switch-slider"></span>
              <span class="switch-text">Change View Mode</span>
            </label>
          </div>
        </div>
      </div>
    </section>

    <!-- Holidays Section -->
    <section class="demo-section">
      <div class="section-content">
        <div class="controls-panel">
          <h3>Mark Holidays</h3>
          <p>Be it public holidays, company milestones, or just weekends, you can see it all.</p>

          <div class="switch-group">
            <label class="switch-label">
              <input
                v-model="toggleWeekends"
                type="checkbox"
                class="switch-input"
                @change="updateHolidays"
              />
              <span class="switch-slider"></span>
              <span class="switch-text">Show weekends</span>
            </label>
          </div>

          <div class="switch-group">
            <label class="switch-label">
              <input
                v-model="customWeekends"
                type="checkbox"
                class="switch-input"
                @change="updateHolidays"
              />
              <span class="switch-slider"></span>
              <span class="switch-text">Custom weekends (Fri-Sat)</span>
            </label>
          </div>
        </div>

        <div class="gantt-panel">
          <div ref="holidaysContainer" class="gantt-container"></div>
        </div>
      </div>
    </section>

    <!-- Ignore Section -->
    <section class="demo-section reverse">
      <div class="section-content">
        <div class="gantt-panel">
          <div ref="ignoreContainer" class="gantt-container"></div>
        </div>

        <div class="controls-panel">
          <h3>...or <em>ignore</em> them</h3>
          <p>Remove time periods from your Gantt - they're now completely ignored.</p>

          <div class="switch-group">
            <label class="switch-label">
              <input
                v-model="ignoreWeekends"
                type="checkbox"
                class="switch-input"
                @change="updateIgnore"
              />
              <span class="switch-slider"></span>
              <span class="switch-text">Ignore weekends</span>
            </label>
          </div>
        </div>
      </div>
    </section>

    <!-- Styling Section -->
    <section class="demo-section">
      <div class="section-content full-width">
        <div class="gantt-panel wide">
          <div ref="stylingContainer" class="gantt-container"></div>
        </div>

        <div class="controls-panel narrow">
          <h3>Control the styles completely</h3>

          <h4>Modify Grid</h4>
          <div class="range-group">
            <label class="range-label">
              <span class="range-text">Grid Height:</span>
              <input
                v-model.number="gridHeight"
                type="range"
                min="150"
                max="600"
                class="range-input"
                @input="updateStyling"
              />
              <span class="range-value">{{ gridHeight }}</span>
            </label>
          </div>

          <div class="range-group">
            <label class="range-label">
              <span class="range-text">Padding:</span>
              <input
                v-model.number="padding"
                type="range"
                min="3"
                max="50"
                class="range-input"
                @input="updateStyling"
              />
              <span class="range-value">{{ padding }}</span>
            </label>
          </div>

          <div class="range-group">
            <label class="range-label">
              <span class="range-text">Column Width:</span>
              <input
                v-model.number="columnWidth"
                type="range"
                min="30"
                max="70"
                class="range-input"
                @input="updateStyling"
              />
              <span class="range-value">{{ columnWidth }}</span>
            </label>
          </div>

          <h4>Modify Bar</h4>
          <div class="range-group">
            <label class="range-label">
              <span class="range-text">Height:</span>
              <input
                v-model.number="barHeight"
                type="range"
                min="10"
                max="100"
                class="range-input"
                @input="updateStyling"
              />
              <span class="range-value">{{ barHeight }}</span>
            </label>
          </div>

          <div class="range-group">
            <label class="range-label">
              <span class="range-text">Radius:</span>
              <input
                v-model.number="barRadius"
                type="range"
                min="1"
                max="50"
                class="range-input"
                @input="updateStyling"
              />
              <span class="range-value">{{ barRadius }}</span>
            </label>
          </div>

          <div class="range-group">
            <label class="range-label">
              <span class="range-text">Arrow Curve:</span>
              <input
                v-model.number="arrowCurve"
                type="range"
                min="1"
                max="50"
                class="range-input"
                @input="updateStyling"
              />
              <span class="range-value">{{ arrowCurve }}</span>
            </label>
          </div>
        </div>
      </div>
    </section>

    <!-- Advanced Section -->
    <section class="demo-section reverse">
      <div class="section-content full-width">
        <div class="controls-panel narrow">
          <h3>Frappe Gantt - <em>for you</em>.</h3>
          <p>Insane levels of customizability - change anything, everything.</p>

          <div class="input-group">
            <label class="input-label">Snap By:</label>
            <div class="input-row">
              <input
                v-model.number="snapAtQty"
                type="number"
                min="1"
                class="number-input"
                @change="updateAdvanced"
              />
              <select v-model="snapAtScale" class="select-input" @change="updateAdvanced">
                <option value="s">Second</option>
                <option value="min">Minute</option>
                <option value="h">Hour</option>
                <option value="d">Day</option>
                <option value="m">Month</option>
                <option value="y">Year</option>
              </select>
            </div>
          </div>

          <div class="switch-group">
            <label class="switch-label">
              <input
                v-model="autoMoveLabel"
                type="checkbox"
                class="switch-input"
                @change="updateAdvanced"
              />
              <span class="switch-slider"></span>
              <span class="switch-text">Auto-moving label</span>
            </label>
          </div>
        </div>

        <div class="gantt-panel wide">
          <div ref="advancedContainer" class="gantt-container"></div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.gantt-demo {
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background: #f8f9fa;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.header h1 {
  font-size: 3rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
  font-family: Georgia, serif;
}

.subtitle {
  font-size: 1.125rem;
  color: #718096;
}

.demo-section {
  margin-bottom: 3rem;
}

.section-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-content.full-width {
  grid-template-columns: 2fr 1fr;
}

.demo-section.reverse .section-content {
  grid-template-columns: 2fr 1fr;
}

.demo-section.reverse .section-content.full-width {
  grid-template-columns: 1fr 2fr;
}

.controls-panel {
  padding: 1rem;
}

.controls-panel.narrow {
  max-width: 400px;
}

.controls-panel h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.75rem;
}

.controls-panel h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2d3748;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.controls-panel p {
  color: #4a5568;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.gantt-panel {
  overflow-x: auto;
}

.gantt-panel.wide {
  min-width: 0;
}

.gantt-container {
  min-height: 300px;
}

/* Switch Styles */
.switch-group {
  margin-bottom: 1rem;
}

.switch-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  gap: 0.75rem;
}

.switch-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-slider {
  position: relative;
  width: 44px;
  height: 24px;
  background-color: #cbd5e0;
  border-radius: 24px;
  transition: background-color 0.3s;
  flex-shrink: 0;
}

.switch-slider::before {
  content: "";
  position: absolute;
  width: 18px;
  height: 18px;
  left: 3px;
  top: 3px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s;
}

.switch-input:checked + .switch-slider {
  background-color: #4299e1;
}

.switch-input:checked + .switch-slider::before {
  transform: translateX(20px);
}

.switch-text {
  color: #2d3748;
  font-size: 0.95rem;
}

/* Range Styles */
.range-group {
  margin-bottom: 1rem;
}

.range-label {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.range-text {
  color: #4a5568;
  font-size: 0.875rem;
  font-weight: 500;
}

.range-input {
  width: 100%;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: #4299e1;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s;
}

.range-input::-webkit-slider-thumb:hover {
  background: #3182ce;
}

.range-input::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: #4299e1;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  transition: background 0.2s;
}

.range-input::-moz-range-thumb:hover {
  background: #3182ce;
}

.range-value {
  color: #2d3748;
  font-size: 0.875rem;
  font-weight: 600;
  text-align: right;
}

/* Input Group Styles */
.input-group {
  margin-bottom: 1.5rem;
}

.input-label {
  display: block;
  color: #2d3748;
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.input-row {
  display: flex;
  gap: 0.5rem;
}

.number-input {
  flex: 0 0 80px;
  padding: 0.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.95rem;
  color: #2d3748;
  transition: border-color 0.2s;
}

.number-input:focus {
  outline: none;
  border-color: #4299e1;
}

.select-input {
  flex: 1;
  padding: 0.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.95rem;
  color: #2d3748;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.select-input:focus {
  outline: none;
  border-color: #4299e1;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .section-content,
  .section-content.full-width,
  .demo-section.reverse .section-content,
  .demo-section.reverse .section-content.full-width {
    grid-template-columns: 1fr;
  }

  .controls-panel.narrow {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .gantt-demo {
    padding: 1rem;
  }

  .header h1 {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .section-content {
    padding: 1.5rem;
  }

  .controls-panel h3 {
    font-size: 1.25rem;
  }
}
</style>
