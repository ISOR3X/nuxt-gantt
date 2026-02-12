import { tw } from "../runtime/utils/common";

export default {
  slots: {
    root: tw("absolute w-full border-b border-muted"),
    input: tw("truncate rounded-none"),
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
