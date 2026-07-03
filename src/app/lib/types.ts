export type PageId =
  | 'pg-dashboard'
  | 'pg-inventory'
  | 'pg-scan'
  | 'pg-transfers'
  | 'pg-prescriptions'
  | 'pg-coldchain'
  | 'pg-expiry'
  | 'pg-network'
  | 'pg-facilities'
  | 'pg-users'
  | 'pg-audit'
  | 'pg-settings';

export type AuthView = 'login' | 'register' | 'app';

export type Theme = 'light' | 'dark';

export type ModalId =
  | 'modal-export'
  | 'modal-transfer'
  | 'modal-breach'
  | 'modal-prescription'
  | 'modal-notifications'
  | 'modal-onboard'
  | 'modal-user';

/** Props shared by every page component that needs to trigger navigation or open a modal. */
export interface PageProps {
  onNav: (id: PageId) => void;
  onOpenModal: (id: ModalId) => void;
}
