export function createStore(
  reducer: Function,
  initState: object,
  enhancer?: Function
) {
  let state = initState || {};
  let isDispatch = false;
  const listeners: (() => void)[] = [];

  if (typeof enhancer === "function") {
    return enhancer(createStore)(reducer, initState);
  }

  // 获取state
  function getState() {
    if (isDispatch) {
      throw new Error("isDispatching, do not getState");
    }
    return state;
  }

  // 订阅
  function subscribe(listener: () => void) {
    if (isDispatch) {
      throw new Error("isDispatching");
    }
    let isSubscribed = true;
    listeners.push(listener);
    return () => {
      if (!isSubscribed) {
        return;
      }
      isSubscribed = false;
      const index = listeners.findIndex(listener);
      listeners.splice(index, 1);
    };
  }

  // dispatch
  function dispatch(action: { type: string; [k: string]: any }) {
    if (isDispatch) {
      throw new Error("isDispatching");
    }
    try {
      isDispatch = true;
      state = reducer(state, action);
    } finally {
      isDispatch = false;
    }

    for (let i = 0; i < listeners.length; i++) {
      listeners[i]();
    }

    return action;
  }

  return {
    getState,
    subscribe,
    dispatch,
  };
}
