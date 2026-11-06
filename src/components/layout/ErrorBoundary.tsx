import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

/** Captura errores de renderizado para que una vista rota no tumbe toda la app. */
export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('Error de UI', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="mx-auto max-w-md py-16 text-center">
          <h2 className="text-xl font-semibold">Algo salió mal en esta vista</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Intenta de nuevo. Si sigue pasando, recarga la página.</p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="mt-6 rounded-lg bg-sky-900 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800"
          >
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
