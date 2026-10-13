import React from 'react';

// Without a boundary, ONE render error (say an order with a missing field) blanks the
// whole site. This shows a friendly message instead, and resets itself when the visitor
// navigates to another page (the parent passes the pathname as `resetKey`).
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, resetKey: props.resetKey };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.resetKey !== state.resetKey) return { hasError: false, resetKey: props.resetKey };
    return null;
  }

  componentDidCatch(error, info) {
    console.error('UI error caught by ErrorBoundary:', error, info?.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4" role="alert">
        <div className="max-w-md text-center bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-6">This page hit an unexpected problem. Reloading usually fixes it.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => window.location.reload()} className="bg-nyoranixRed text-white px-5 py-2 rounded-full font-bold hover:bg-red-700">Reload page</button>
            <a href="/" className="border border-gray-300 text-gray-700 px-5 py-2 rounded-full font-bold hover:bg-gray-50">Go home</a>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
