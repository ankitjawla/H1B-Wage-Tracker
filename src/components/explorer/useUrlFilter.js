import { useCallback, useState } from "react";
import { readFilter, writeFilter } from "../../utils/explorerUrl";

/**
 * State bound to a deep-linkable explorer filter param (`?f_<name>=`).
 * Initializes from the URL so links like `?view=explorer&tab=wages&f_state=CA`
 * pre-fill the filter, and keeps the URL in sync on change.
 *
 * @param {"state"|"soc"|"salary"|"employer"} name
 * @returns {[string, (value: string) => void]}
 */
export function useUrlFilter(name) {
  const [value, setValue] = useState(() => readFilter(name));

  const update = useCallback(
    (next) => {
      setValue(next);
      writeFilter(name, next);
    },
    [name]
  );

  return [value, update];
}
