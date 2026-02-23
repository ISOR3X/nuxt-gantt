import { colors, tw } from "../runtime/utils/common";

export default {
  slots: {
    markerRoot: tw("absolute bottom-0"),
    markerBody: tw("h-3"),
    markerContent: tw(
      "pointer-events-none absolute -bottom-[29px] inline-flex w-full justify-center text-nowrap",
    ),
    bodyRoot: tw("group pointer-events-auto"),
    bodyContent: tw("transition-color h-full"),
    bodyBackground: tw("h-full"),
  },
  variants: {
    color: Object.fromEntries(colors.map((color: string) => [color, ""])),
    deadline: {
      true: {
        markerRoot: tw("-translate-x-1/2"),
        markerBody: tw("mx-auto h-2 w-2 translate-y-1 rounded-full"),
        bodyContent: tw("stroke-1 group-hover:stroke-3"),
        bodyBackground: tw("stroke-transparent stroke-30"),
      },
      false: {
        markerBody: tw("h-[1px]"),
        bodyContent: tw("opacity-20 group-hover:opacity-30"),
        bodyBackground: tw("w-5 fill-transparent"),
      },
    },
    readOnly: {
      false: {
        bodyBackground: tw("hover:cursor-ew-resize"),
      },
    },
  },
  compoundVariants: [
    ...colors.map((color: string) => ({
      color,
      deadline: true,
      class: {
        markerBody: tw(`bg-${color}`),
        bodyContent: tw(`stroke-${color}`),
      },
    })),
    ...colors.map((color: string) => ({
      color,
      deadline: false,
      class: {
        markerBody: tw(`bg-${color}`),
        bodyContent: tw(`fill-${color}`),
      },
    })),
  ],
  defaultVariants: {
    color: "primary",
  },
};
