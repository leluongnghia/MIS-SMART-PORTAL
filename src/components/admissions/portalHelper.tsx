/**
 * Utility: renderModal
 * Mount modal vào document.body qua React Portal để tránh bị bẫy
 * bởi overflow:hidden / transform / contain của container cha.
 *
 * Dùng:
 *   import { renderModal } from '@/components/admissions/portalHelper';
 *   ...
 *   {hienModal && renderModal(<YourModal />)}
 */

import { createPortal } from 'react-dom';
import React from 'react';

export function renderModal(children: React.ReactNode): React.ReactPortal | null {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}
