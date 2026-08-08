/**
 * Desk styling — every shared const now lives in the neutral module
 * (src/components/ui.ts); this file re-exports so desk imports stay local
 * to the desk scope. Add here only what is desk-specific.
 */

export {
  mono,
  display,
  capsLabel,
  field,
  labelStyle,
  button,
  buttonQuiet,
  buttonDanger,
  resultStyle,
} from "@/components/ui";
