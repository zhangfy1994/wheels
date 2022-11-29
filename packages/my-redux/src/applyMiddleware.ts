import { compose } from "./compose";

export function applyMiddleware(...middlewares: Function[]) {
  return (createStore: Function) => (reducer: Function, state: object) => {
    const store = createStore(reducer, state);
    let dispatch = (__action: object) => {
      throw new Error(
        "Dispatching while constructing your middleware is not allowed"
      );
    };

    const middlewareApi = {
      getState: store.getState,
      dispatch: (action: object) => dispatch(action),
    };

    const chain = middlewares.map((middleware) => middleware(middlewareApi));
    dispatch = compose(...chain)(store.dispatch);

    return {
      ...store,
      dispatch,
    };
  };
}
