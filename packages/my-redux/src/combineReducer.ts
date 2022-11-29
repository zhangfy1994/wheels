export function combineReducer(reducers: Record<string, Function>) {
  return function combine(
    state: Record<string, any>,
    action: Record<string, any>
  ) {
    const newState: Record<string, any> = {};
    const keys = Object.keys(reducers);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      newState[key] = reducers[key](state[key], action);
    }

    return newState;
  };
}
