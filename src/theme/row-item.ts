import { tw } from "../runtime/utils/common";

export default {
  slots: {
    root: tw("group absolute inline-flex w-full items-center overflow-clip border-b border-muted"),
    inputBase: tw("truncate rounded-none disabled:cursor-default disabled:opacity-100"),
    inputRoot: tw("w-full"),
    button: tw("hidden rounded-none group-hover:block"),
  },
  variants: {
    highlight: {
      true: {
        root: tw(
          "after:pointer-events-none after:absolute after:top-0 after:bottom-0 after:left-0 after:w-[1px] after:bg-primary",
        ),
      },
    },
  },
};
