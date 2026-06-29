import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in Mellodi App:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (this as any).props.fallback || (
        <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-coffee-100 shadow-xl space-y-6">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.33-1.2 3 1.732 3z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-lg font-bold text-coffee-950">Đã xảy ra lỗi hệ thống</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Hệ thống gặp sự cố không mong muốn khi tải trang. Vui lòng bấm nút dưới đây để tải lại trang hoặc đăng xuất để reset phiên làm việc.
              </p>
              {this.state.error && (
                <pre className="mt-3 p-3 bg-stone-50 rounded-xl border border-stone-200 text-[10px] font-mono text-left text-rose-700 overflow-x-auto max-h-[100px] whitespace-pre-wrap">
                  {this.state.error.toString()}
                </pre>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-3 bg-[#2D5A47] hover:bg-[#1E3F31] text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
              >
                Tải lại trang
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/';
                }}
                className="flex-1 py-3 border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Đăng xuất / Reset
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
