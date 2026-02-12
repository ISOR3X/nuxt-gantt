import { tw } from "../runtime/utils/common";

export default {
  slots: {
    root: tw("pointer-events-none absolute inset-0 z-0 h-full w-full"),
    backgroundRect: tw("fill-transparent"),
    verticalLines: tw("stroke-default stroke-1"),
    horizontalLines: tw("stroke-default stroke-1"),
  },
};
