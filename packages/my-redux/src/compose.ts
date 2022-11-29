// type Fun<T extends any[], R> = (...a: T) => R;

// compose(f, g, h) => (...args) => f(g(h(...args)))
export function compose(...funcs: Function[]) {
  if (funcs.length === 0) {
    return (...args: unknown[]) => args;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((pre, cur) => (...args: unknown[]) => {
    return pre(cur(...args));
  });
}
