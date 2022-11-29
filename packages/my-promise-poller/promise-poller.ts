// 判断promise 是否超时
function timeout(promise: Promise<any>, time: number) {
  return new Promise((resolve, reject) => {
    const timeId = setTimeout(() => {
      reject("timeout");
    }, time);

    promise
      .then((res) => {
        clearTimeout(timeId);
        resolve(res);
      })
      .catch((error) => {
        clearTimeout(timeId);
        reject(error);
      });
  });
}

function delay(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

const strategies = {
  "fixed-interval": {
    defaults: {
      interval: 1000,
    },
    getNextInterval(count: number, options: Options) {
      return options.interval;
    },
  },

  "linear-backoff": {
    defaults: {
      start: 1000,
      increment: 1000,
    },
    getNextInterval(count: number, options: Options) {
      return options.start + options.increment * count;
    },
  },
  "exponential-backoff": {
    defaults: {
      min: 1000,
      max: 30000,
    },
    getNextInterval: function (count: number, options: Options) {
      return Math.min(
        options.max,
        Math.round(
          Math.random() * (Math.pow(2, count) * 1000 - options.min) +
            options.min
        )
      );
    },
  },
};

type StrategyName = "fixed-interval" | "linear-backoff" | "exponential-backoff";

interface Options {
  taskFn: () => any;
  shouldContinue: (error: Error | string | null, result?: any) => boolean;
  progressCallback?: (retriesRemain: number, error: Error | string) => void;
  masterTimeout?: number;
  taskTimeout?: number;
  retries?: number;
  strategy?: StrategyName;
  interval?: number;
  // linear-backoff 策略
  start?: number;
  increment?: number;
  // exponential-backoff 策略
  min?: number;
  max?: number;
}

function promisePoller(options: Options) {
  const strategy = strategies[options.strategy] || strategies["fixed-interval"];
  const mergeOptions = { ...strategy.defaults, ...options };

  const {
    taskFn,
    shouldContinue,
    progressCallback,
    masterTimeout,
    taskTimeout,
    retries = 5,
  } = mergeOptions;

  if (typeof taskFn !== "function") {
    throw new Error("taskFn must be a function");
  }

  if (typeof shouldContinue !== "function") {
    throw new Error("shouldContinue must be a function");
  }

  let timeId: NodeJS.Timeout;
  let retriesRemain = retries;
  const rejections: Array<Error | string> = [];

  return new Promise((resolve, reject) => {
    if (masterTimeout) {
      timeId = setTimeout(() => {
        reject("masterTimeout");
      }, masterTimeout);
    }
    const poll = () => {
      let taskPromise = Promise.resolve(taskFn());
      if (taskTimeout) {
        taskPromise = timeout(taskPromise, taskTimeout);
      }

      taskPromise
        .then((res) => {
          if (shouldContinue(null, res)) {
            const nextInterval = strategy.getNextInterval(
              retries - retriesRemain,
              mergeOptions
            );
            delay(nextInterval).then(poll);
          } else {
            timeId && clearTimeout(timeId);
            resolve(res);
          }
        })
        .catch((error) => {
          rejections.push(error);

          if (--retriesRemain && shouldContinue(error)) {
            progressCallback?.(retries - retriesRemain, error);
            const nextInterval = strategy.getNextInterval(
              retries - retriesRemain,
              mergeOptions
            );
            delay(nextInterval).then(poll);
          } else {
            reject(rejections);
          }
        });
    };

    poll();
  });
}
