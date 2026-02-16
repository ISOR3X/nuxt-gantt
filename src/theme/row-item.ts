import { tw } from "../runtime/utils/common";

export default {
  slots: {
    root: tw("group absolute inline-flex w-full items-center overflow-clip border-b border-muted"),
    input: tw("truncate rounded-none disabled:cursor-default disabled:opacity-100"),
    button: tw("rounded-none opacity-0 transition-opacity group-hover:opacity-100"),
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
