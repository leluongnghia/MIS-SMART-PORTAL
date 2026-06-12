import { Component, type ErrorInfo, type ReactNode } from 'react';

type AppErrorBoundaryState = {
  hasError: boolean;
  message: string;
};

type AppErrorBoundaryProps = {
  children: ReactNode;
};

const APP_STORAGE_PREFIXES = [
  'mis_',
  'school_task_manager_',
];

export default class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
    message: '',
  };

  static getDerivedStateFromError(error: unknown): AppErrorBoundaryState {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'Lỗi không xác định',
    };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('MIS Smart Portal runtime error:', error, info);
  }

  private clearSessionAndReload = () => {
    try {
      Object.keys(localStorage).forEach(key => {
        if (APP_STORAGE_PREFIXES.some(prefix => key.startsWith(prefix))) {
          localStorage.removeItem(key);
        }
      });
      sessionStorage.clear();
    } catch (error) {
      console.warn('Could not clear local session:', error);
    }
    window.location.replace(`${window.location.origin}${window.location.pathname}?recovered=${Date.now()}`);
  };

  render() {
    if (!this.state.hasError) return (this as unknown as { props: AppErrorBoundaryProps }).props.children;

    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 font-sans">
        <section className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/10 p-6 shadow-2xl space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-200">MIS Smart Portal</p>
            <h1 className="mt-2 text-2xl font-black">Phiên làm việc cần được khôi phục</h1>
          </div>
          <p className="text-sm leading-6 text-slate-200">
            Trình duyệt đang giữ dữ liệu phiên hoặc cache cũ khiến giao diện không thể mở bình thường. Bấm nút bên dưới để làm mới phiên đăng nhập trên máy này.
          </p>
          {this.state.message && (
            <pre className="max-h-28 overflow-auto rounded-xl bg-black/30 p-3 text-[11px] text-slate-300 whitespace-pre-wrap">
              {this.state.message}
            </pre>
          )}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={this.clearSessionAndReload}
              className="rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-400"
            >
              Khôi phục phiên
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-bold text-slate-100 hover:bg-white/10"
            >
              Tải lại trang
            </button>
          </div>
        </section>
      </main>
    );
  }
}
