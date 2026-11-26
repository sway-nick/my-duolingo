const MAX_STACK_DEPTH = 15;
const _navStack = (typeof globalThis !== 'undefined' && Array.isArray(globalThis.__ebSharedNavStack))
  ? globalThis.__ebSharedNavStack
  : ((typeof globalThis !== 'undefined') ? (globalThis.__ebSharedNavStack = []) : []);

/**
 * Push a navigation return entry onto the in-memory stack (max depth 15).
 * Only pushes if entry is valid and entry.restore is a function.
 * @param {{ label?: string, restore: Function }} entry
 */
export function pushNavReturn(entry) {
  if (!entry || typeof entry.restore !== 'function') return;
  if (_navStack.length >= MAX_STACK_DEPTH) {
    _navStack.shift();
  }
  _navStack.push({
    label: typeof entry.label === 'string' ? entry.label : String(entry.label || ''),
    restore: entry.restore,
  });
}

/**
 * Pop the top navigation return entry and invoke its restore callback.
 * @returns {boolean} true if an entry was popped and restored, false if stack is empty
 */
export function popNavReturn() {
  if (_navStack.length === 0) return false;
  const entry = _navStack.pop();
  if (entry && typeof entry.restore === 'function') {
    entry.restore();
  }
  return true;
}

/**
 * Check whether there is at least one return entry on the stack.
 * @returns {boolean}
 */
export function hasNavReturn() {
  return _navStack.length > 0;
}

/**
 * Clear all entries from the navigation return stack.
 */
export function clearNavReturn() {
  _navStack.length = 0;
}

/**
 * Push a parent restore callback onto the stack and open the target view.
 * @param {Function} restoreParentFn
 * @param {Function} openTargetFn
 * @param {string} [label='']
 */
export function navigateWithReturn(restoreParentFn, openTargetFn, label = '') {
  if (typeof restoreParentFn === 'function') {
    pushNavReturn({ label, restore: restoreParentFn });
  }
  if (typeof openTargetFn === 'function') {
    openTargetFn();
  }
}

if (typeof window !== 'undefined') {
  window._ebNavStack = {
    pushNavReturn,
    popNavReturn,
    hasNavReturn,
    clearNavReturn,
    navigateWithReturn,
  };
}
