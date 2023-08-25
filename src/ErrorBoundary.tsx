import React, { ErrorInfo, ReactNode, useState, useEffect } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  const [errorState, setErrorState] = useState<ErrorBoundaryState>({ hasError: false });

  useEffect(() => {
    setErrorState({ hasError: false });
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const componentDidCatch = (error: Error, errorInfo: ErrorInfo): void => {
    // You can log the error or send it to an error tracking service
    console.error('Uncaught Error:', error, errorInfo);
    setErrorState({ hasError: true });
  };

  if (errorState.hasError) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100vh'
        }}
      >
        {/* <h2>Something went wrong.</h2> */}
        <img src="error.png" alt="Error" width="200" />
      </div>
    );
  } else {
    return <>{children}</>;
  }
};

export default ErrorBoundary;
