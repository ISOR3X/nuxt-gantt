import { tw } from "../runtime/utils/common";

export default {
  slots: {
    root: tw("absolute py-1"),
    base: tw(
      "inline-flex h-full w-full items-center overflow-clip border-2 border-primary bg-primary/30 px-1 text-sm",
    ),
  },
  variants: {
    milestone: {
      true: {
        base: tw("bevel rounded-full"),
      },
    },
  },
};
