'use client';

export interface SwalOptions {
  title?: string;
  text?: string;
  html?: string;
  icon?: 'success' | 'error' | 'warning' | 'info' | 'question';
  showCancelButton?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonColor?: string;
  cancelButtonColor?: string;
}

export interface SwalResult {
  isConfirmed: boolean;
  isDismissed: boolean;
}

/**
 * Inject custom keyframe styles for dynamic, smooth SweetAlert spring animations
 */
function injectSwalStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('swal-custom-styles')) return;

  const styleTag = document.createElement('style');
  styleTag.id = 'swal-custom-styles';
  styleTag.innerHTML = `
    @keyframes swalBackdropIn {
      0% { opacity: 0; backdrop-filter: blur(0px); }
      100% { opacity: 1; backdrop-filter: blur(8px); }
    }
    @keyframes swalBackdropOut {
      0% { opacity: 1; backdrop-filter: blur(8px); }
      100% { opacity: 0; backdrop-filter: blur(0px); }
    }
    @keyframes swalSpringIn {
      0% { opacity: 0; transform: scale(0.65) translateY(30px); }
      60% { opacity: 1; transform: scale(1.04) translateY(-4px); }
      82% { transform: scale(0.97) translateY(2px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes swalSpringOut {
      0% { opacity: 1; transform: scale(1) translateY(0); }
      100% { opacity: 0; transform: scale(0.85) translateY(16px); }
    }
    @keyframes swalIconPop {
      0% { opacity: 0; transform: scale(0.3) rotate(-15deg); }
      60% { opacity: 1; transform: scale(1.18) rotate(6deg); }
      80% { transform: scale(0.94) rotate(-2deg); }
      100% { opacity: 1; transform: scale(1) rotate(0deg); }
    }
    .swal-backdrop-in {
      animation: swalBackdropIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .swal-backdrop-out {
      animation: swalBackdropOut 0.25s cubic-bezier(0.7, 0, 0.84, 0) forwards;
    }
    .swal-modal-in {
      animation: swalSpringIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    .swal-modal-out {
      animation: swalSpringOut 0.25s cubic-bezier(0.7, 0, 0.84, 0) forwards;
    }
    .swal-icon-anim {
      animation: swalIconPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.08s both;
    }
  `;
  document.head.appendChild(styleTag);
}

/**
 * Custom SweetAlert implementation that renders sleek, animated SweetAlert popups
 * matching the application design system with smooth spring physics.
 */
class CustomSweetAlert {
  fire(
    titleOrOptions?: string | SwalOptions,
    text?: string,
    icon?: 'success' | 'error' | 'warning' | 'info' | 'question'
  ): Promise<SwalResult> {
    injectSwalStyles();

    return new Promise((resolve) => {
      let options: SwalOptions = {};
      if (typeof titleOrOptions === 'string') {
        options = { title: titleOrOptions, text: text || '', icon: icon || 'info' };
      } else if (titleOrOptions) {
        options = titleOrOptions;
      }

      const {
        title = '',
        text: bodyText = '',
        html = '',
        icon: swalIcon = 'info',
        showCancelButton = false,
        confirmButtonText = 'OK',
        cancelButtonText = 'Batal',
      } = options;

      // Create overlay container
      const container = document.createElement('div');
      container.className = 'fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/50 swal-backdrop-in';

      // Custom animated icon markups
      let iconMarkup = '';
      if (swalIcon === 'success') {
        iconMarkup = `
          <div class="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center mx-auto mb-4 swal-icon-anim shadow-lg shadow-emerald-500/10">
            <svg class="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        `;
      } else if (swalIcon === 'error') {
        iconMarkup = `
          <div class="w-16 h-16 rounded-full bg-rose-50 border-2 border-rose-500 text-rose-600 flex items-center justify-center mx-auto mb-4 swal-icon-anim shadow-lg shadow-rose-500/10">
            <svg class="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        `;
      } else if (swalIcon === 'warning') {
        iconMarkup = `
          <div class="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-500 text-amber-600 flex items-center justify-center mx-auto mb-4 swal-icon-anim shadow-lg shadow-amber-500/10">
            <svg class="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        `;
      } else {
        iconMarkup = `
          <div class="w-16 h-16 rounded-full bg-indigo-50 border-2 border-indigo-500 text-indigo-600 flex items-center justify-center mx-auto mb-4 swal-icon-anim shadow-lg shadow-indigo-500/10">
            <svg class="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        `;
      }

      const confirmBtnClass = swalIcon === 'warning' || swalIcon === 'error'
        ? 'bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-rose-600/25 transition-all duration-200 cursor-pointer hover:-translate-y-0.5'
        : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-indigo-600/25 transition-all duration-200 cursor-pointer hover:-translate-y-0.5';

      const contentHtml = html ? html : bodyText ? `<p class="text-sm text-slate-500 mt-1.5 leading-relaxed">${bodyText}</p>` : '';

      container.innerHTML = `
        <div id="swal-modal-box" class="bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] p-6 max-w-sm w-full text-center border border-slate-100/80 swal-modal-in">
          ${iconMarkup}
          ${title ? `<h3 class="text-lg font-bold text-slate-900 tracking-tight">${title}</h3>` : ''}
          ${contentHtml}
          <div class="mt-6 flex items-center justify-center gap-3">
            ${showCancelButton ? `
              <button id="swal-cancel-btn" class="bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer hover:-translate-y-0.5">
                ${cancelButtonText}
              </button>
            ` : ''}
            <button id="swal-confirm-btn" class="${confirmBtnClass}">
              ${confirmButtonText}
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(container);

      const modalBox = container.querySelector('#swal-modal-box');

      const cleanup = (isConfirmed: boolean) => {
        container.classList.remove('swal-backdrop-in');
        container.classList.add('swal-backdrop-out');
        if (modalBox) {
          modalBox.classList.remove('swal-modal-in');
          modalBox.classList.add('swal-modal-out');
        }

        setTimeout(() => {
          if (document.body.contains(container)) {
            document.body.removeChild(container);
          }
          resolve({ isConfirmed, isDismissed: !isConfirmed });
        }, 220);
      };

      const confirmBtn = container.querySelector('#swal-confirm-btn');
      const cancelBtn = container.querySelector('#swal-cancel-btn');

      confirmBtn?.addEventListener('click', () => cleanup(true));
      cancelBtn?.addEventListener('click', () => cleanup(false));
      container.addEventListener('click', (e) => {
        if (e.target === container) cleanup(false);
      });
    });
  }

  // Quick helper methods
  success(title: string, text?: string) {
    return this.fire({ title, text, icon: 'success' });
  }

  error(title: string, text?: string) {
    return this.fire({ title, text, icon: 'error' });
  }

  warning(title: string, text?: string) {
    return this.fire({ title, text, icon: 'warning' });
  }

  info(title: string, text?: string) {
    return this.fire({ title, text, icon: 'info' });
  }

  confirm(title: string, text?: string, confirmText = 'Ya, Lanjutkan') {
    return this.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: 'Batal',
    });
  }
}

export const Swal = new CustomSweetAlert();
export default Swal;
