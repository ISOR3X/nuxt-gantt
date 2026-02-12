import { tw } from "../runtime/utils/common";

const handleCommon = tw("absolute aspect-square h-full p-2");

export default {
  slots: {
    root: tw("group absolute py-1"),
    base: tw(
      "inline-flex h-full w-full items-center overflow-clip border-2 border-primary bg-primary/30 px-1 text-sm",
    ),
    leftHandleRoot: [handleCommon, tw(" bottom-0 -left-4 -translate-x-1/2 cursor-ew-resize")],
    rightHandleRoot: [handleCommon, tw("-right-4 bottom-0 translate-x-1/2 cursor-ew-resize")],
    handle: tw("h-full rounded-full border-2 border-accented"),
  },
  variants: {
    milestone: {
      true: {
        base: tw("bevel rounded-full"),
      },
    },
  },
};
