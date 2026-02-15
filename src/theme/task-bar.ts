import { tw } from "../runtime/utils/common";

const handleCommon = tw("absolute bottom-0 z-10 h-full w-3");

export default {
  slots: {
    root: tw("group absolute py-1"),
    base: tw(
      "relative flex h-full w-full items-center overflow-clip rounded-sm border-2 border-primary bg-primary/30 px-1 text-sm",
    ),
    progress: tw("absolute bottom-0 left-0 h-full bg-primary"),
    leftHandle: [handleCommon, tw("-translate-x-1/2")],
    rightHandle: [handleCommon, tw("right-0 translate-x-1/2")],
  },
  variants: {
    milestone: {
      true: {
        base: tw("bevel rounded-full"),
      },
    },
    readOnly: {
      false: {
        leftHandle: "cursor-ew-resize",
        rightHandle: "cursor-ew-resize",
      },
    },
  },
};
