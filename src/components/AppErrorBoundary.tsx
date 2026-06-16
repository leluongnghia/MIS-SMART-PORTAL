import { serverStorage } from '../libs/client/server-storage';
import { Component, type ErrorInfo, type ReactNode } from 'react';

type AppErrorBoundaryState = {
  hasError: boolean;
  message: string;
  isChunkLoad?: boolean;
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
    isChunkLoad: false,
  };

  static getDerivedStateFromError(error: unknown): AppErrorBoundaryState {
    const message = error instanceof Error ? error.message : String(error);
    const isChunkLoad =
      message.includes('Failed to load chunk') ||
      message.includes('ChunkLoadError') ||
      message.includes('loading css chunk') ||
      message.includes('Loading chunk');

    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'Lỗi không xác định',
      isChunkLoad,
    };
  }

  componentDidMount() {
    window.addEventListener('error', this.handleWindowError, true);
  }

  componentWillUnmount() {
    window.removeEventListener('error', this.handleWindowError, true);
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('MIS Smart Portal runtime error:', error, info);
    if (this.state.isChunkLoad) {
      this.handleChunkLoadError();
    }
  }

  private handleWindowError = (event: ErrorEvent) => {
    try {
      const target = event.target as any;
      if (target && (target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
        const src = target.src || target.href;
        if (src && (src.includes('/_next/static/') || src.includes('/chunks/'))) {
          console.warn('MIS Smart Portal: Failed to load resource chunk:', src);
          this.handleChunkLoadError();
        }
      }
    } catch (e) {
      console.error('Error in handleWindowError:', e);
    }
  };

  private handleChunkLoadError = () => {
    try {
      const lastReload = sessionStorage.getItem('mis_last_chunk_reload');
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 15000) {
        sessionStorage.setItem('mis_last_chunk_reload', String(now));
        window.location.reload();
      } else {
        // If we already tried reloading within 15 seconds, don't loop
        this.setState({ isChunkLoad: false });
      }
    } catch (e) {
      console.warn('Could not handle chunk load error:', e);
      window.location.reload();
    }
  };

  private clearSessionAndReload = () => {
    try {
      ['mis_last_chunk_reload', 'mis_edutask_logged_in', 'mis_edutask_logged_in_user_id', 'mis_admin_theme', 'mis_theme'].forEach(key => {
        serverStorage.removeItem(key);
      });
      sessionStorage.clear();
    } catch (error) {
      console.warn('Could not clear local session:', error);
    }
    window.location.replace(`${window.location.origin}${window.location.pathname}?recovered=${Date.now()}`);
  };

  render() {
    if (!this.state.hasError) return (this as unknown as { props: AppErrorBoundaryProps }).props.children;

    if (this.state.isChunkLoad) {
      return (
        <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-indigo-200">MIS Smart Portal</p>
            <h1 className="text-xl font-bold">Đang cập nhật phiên bản mới...</h1>
            <p className="text-xs text-slate-400 max-w-xs">
              Hệ thống đang tự động tải lại các thành phần mới của ứng dụng. Vui lòng chờ trong giây lát.
            </p>
          </div>
        </main>
      );
    }

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
