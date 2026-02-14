import { tw } from "../runtime/utils/common";

export default {
  slots: {
    root: "relative isolate grid h-full overflow-auto",
    corner: tw(
      "sticky top-0 left-0 z-20 flex items-center justify-between border-r border-b border-muted bg-default px-1",
    ),
    firstRow: tw("sticky top-0 z-10 border-b border-muted bg-default"),
    firstCol: tw("sticky left-0 z-10 border-r border-muted bg-default"),
    gridContainer: tw("relative isolate"),
    svgLayer: tw("pointer-events-none absolute inset-0 z-0 h-full w-full"),
  },
};
