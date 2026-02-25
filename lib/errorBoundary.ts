"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

// --- 1. Type Definitions ---

interface ErrorBoundaryProps {
  // A required prop to specify the UI to display when an error occurs.
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// --- 2. The ErrorBoundary Class Component ---

/**
 * React Error Boundary component.
 * Catches JavaScript errors in the child component tree, logs them, 
 * and renders a fallback UI.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Initialize state
  public state: ErrorBoundaryState = {
    hasError: false,
  };

  /**
   * 1. This static method is called after an error has been thrown by a 
   * descendant component. It receives the error and should return a value 
   * to update state.
   */
  public static getDerivedStateFromError(): ErrorBoundaryState {
    // Update state to indicate an error occurred.
    return { hasError: true };
  }

  /**
   * 2. This method is called after an error has been thrown. It's used for 
   * side effects like logging the error information.
   * * @param error - The error that was thrown.
   * @param errorInfo - An object with a componentStack key that holds information 
   * about which component threw the error.
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can log the error to an external error tracking service here (e.g., Sentry, LogRocket, custom API)
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    // Example logging call (hypothetical):
    // logErrorToMyService(error, errorInfo);
  }

  // --- 3. Render Method ---
  
  public render() {
    // If an error occurred, render the fallback UI passed as a prop.
    if (this.state.hasError) {
      return this.props.fallback;
    }

    // Otherwise, render the children normally.
    return this.props.children;
  }
}

export default ErrorBoundary;