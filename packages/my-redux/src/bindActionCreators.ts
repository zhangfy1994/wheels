function bindActionCreator(creator: Function, dispatch: Function) {
  return function (this: any, ...args: any[]) {
    return dispatch(creator.apply(this, args));
  };
}

export function bindActionCreators(
  creators: Function | Record<string, Function>,
  dispatch: Function
) {
  if (typeof creators === "function") {
    return bindActionCreator(creators, dispatch);
  }

  if (typeof creators !== "object" || creators === null) {
    throw new Error("creators should be function or object");
  }

  const result = {} as Record<string, Function>;
  for (let key in creators) {
    const creator = creators[key];
    if (typeof creator === "function") {
      result[key] = bindActionCreator(creator, dispatch);
    }
  }

  return result;
}
