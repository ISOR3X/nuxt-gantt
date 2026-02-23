import { tw } from "../runtime/utils/common";

const handleCommon = tw("absolute bottom-0 z-10 h-full w-3");

export default (colors: string[]) => ({
  slots: {
    root: tw("group absolute py-1"),
    base: tw(
      "relative flex h-full w-full items-center overflow-clip rounded-sm border-2 px-1 text-sm",
    ),
    progress: tw("absolute bottom-0 left-0 h-full"),
    leftHandle: [handleCommon, tw("-translate-x-1/2")],
    rightHandle: [handleCommon, tw("right-0 translate-x-1/2")],
  },
  variants: {
    color: Object.fromEntries(colors.map((color: string) => [color, ""])),
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
  compoundVariants: colors.map((color: string) => ({
    color,
    class: {
      base: tw(`border-${color} bg-${color}/30`),
      progress: tw(`bg-${color}`),
    },
  })),
  defaultVariants: {
    color: "primary",
  },
});
