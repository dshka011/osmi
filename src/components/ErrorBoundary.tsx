import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Можно логировать ошибку
    // console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-red-50">
          <div className="bg-white p-8 rounded-xl shadow-md border border-red-200 max-w-md text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Произошла ошибка</h2>
            <p className="text-gray-700 mb-2">{this.state.error?.message || 'Не удалось загрузить приложение.'}</p>
            <p className="text-gray-400 text-sm">Попробуйте перезагрузить страницу или обратитесь к поддержке.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary; 