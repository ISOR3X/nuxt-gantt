<script setup lang="ts"></script>

<template>
  <div id="grid">
    <div class="cell sticky-left sticky-top z-10">crnr</div>
    <div class="cell sticky-top">hdr</div>
    <div class="cell sticky-left">col</div>
    <div class="cell cntnt">cntnt</div>
  </div>
</template>

<style>
#grid {
  height: 100%;
  overflow-y: scroll;
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, 1fr);

  .cell {
    border: 1px solid black;
    text-align: center;
    padding: 0.5rem;
    min-width: 20vw;
  }
  .cntnt {
    width: 1000px;
    height: 1000px;
  }

  /* top row */
  .sticky-top {
    position: sticky;
    top: 0;
  }

  /* leftmost column */
  .sticky-left {
    position: sticky;
    left: 0;
  }
}
</style>
