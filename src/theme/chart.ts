export default {
  slots: {
    root: "relative isolate grid h-full overflow-auto",
    corner:
      "sticky left-0 top-0 z-20 flex items-center justify-between border-r border-b border-muted bg-default px-1",
    firstRow: "sticky top-0 z-10 border-b border-muted bg-default",
    firstCol: "sticky left-0 z-10 border-r border-muted bg-default",
    gridContainer: "relative isolate",
  },
};
