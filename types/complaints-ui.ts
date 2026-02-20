export type PortalMode = 'ADMIN' | 'CITIZEN' | 'SUPERVISOR' | 'STAFF';

export type ComplaintTableVariant = 'default' | 'tactical';

export type ComplaintActionType = 
  | 'VIEW' 
  | 'EDIT'
  | 'DELETE' 
  | 'ASSIGN' 
  | 'PRINT' 
  | 'ESCALATE' 
  | 'RESOLVE'
  | 'REJECT'
  | 'VERIFY';

export interface ComplaintTableState {
  pageIndex: number;
  pageSize: number;
  sorting: { id: string; desc: boolean }[];
  rowSelection: Record<string, boolean>;
}
