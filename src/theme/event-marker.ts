import { tw } from "../runtime/utils/common";

export default {
  slots: {
    markerRoot: tw("absolute bottom-0"),
    markerBody: tw("h-3 bg-primary"),
    markerContent: tw(
      "pointer-events-none absolute -bottom-[29px] inline-flex w-full justify-center text-nowrap",
    ),
    bodyRoot: tw("group pointer-events-auto"),
    bodyContent: tw("transition-color h-full"),
    bodyBackground: tw("h-full"),
  },
  variants: {
    deadline: {
      true: {
        markerRoot: tw("-translate-x-1/2"),
        markerBody: tw("mx-auto h-2 w-2 translate-y-1 rounded-full"),
        bodyContent: tw("stroke-primary stroke-1 group-hover:stroke-3"),
        bodyBackground: tw("stroke-transparent stroke-30"),
      },
      false: {
        markerBody: tw("h-[1px]"),
        bodyContent: tw("fill-primary/20 group-hover:fill-primary/30"),
        bodyBackground: tw("w-5 fill-transparent"),
      },
    },
    readOnly: {
      false: {
        bodyBackground: tw("hover:cursor-ew-resize"),
      },
    },
  },
};
