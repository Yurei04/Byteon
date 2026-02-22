"use client"
import { Component } from "react";
import { DatabaseErrorBlocker } from "./database-error-blocker";

export class DbErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("DbErrorBoundary caught:", error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return <DatabaseErrorBlocker isError={true} onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}