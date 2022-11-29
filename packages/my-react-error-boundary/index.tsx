import * as React from "react";

type FallBackElement = React.ReactElement<
  unknown | string | number | React.FC | typeof React.Component
> | null;

export interface FallBackProps {
  error: Error;
  resetErrorBoundary?: () => void;
}
interface ErrorBoundaryProps {
  fallback?: FallBackElement;
  fallbackRender?: (props: FallBackProps) => FallBackElement;
  FallbackComponent?: React.ComponentType<FallBackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onRest?: () => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}
const initState: ErrorBoundaryState = {
  error: null,
};
class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state = initState;

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  hasArrayChanged(arr1: unknown[], arr2: unknown[]) {
    return (
      arr1.length !== arr2.length ||
      arr1.some((item, index) => Object.is(item, arr1[index]))
    );
  }

  reset = () => {
    this.setState(initState);
  };

  resetErrorBoundary = () => {
    this.props.onRest?.();
    this.reset();
  };

  render(): React.ReactNode {
    const { fallback, fallbackRender, FallbackComponent } = this.props;
    const { error } = this.state;

    if (error !== null) {
      if (React.isValidElement(fallback)) {
        return fallback;
      } else if (typeof fallbackRender === "function") {
        const fallbackProps: FallBackProps = {
          error,
          resetErrorBoundary: this.resetErrorBoundary,
        };
        return fallbackRender(fallbackProps);
      } else if (FallbackComponent) {
        return (
          <FallbackComponent
            error={error}
            resetErrorBoundary={this.resetErrorBoundary}
          />
        );
      }
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

function withErrorBoundary<P>(
  Component: React.ComponentType<P>,
  errorBoundaryProps: ErrorBoundaryProps
): React.ComponentType<P> {
  const Wrap: React.ComponentType<P> = (props) => {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  const name = Component.displayName || Component.name || "unknown";
  Wrap.displayName = `withErrorBoundary(${name})`;

  return Wrap;
}

function useHandleError<P = Error>(givenError?: P) {
  const [error, setError] = React.useState<P | null>(null);
  console.log("useHandleError");
  if (givenError) throw givenError;
  if (error) throw error;

  return setError;
}
