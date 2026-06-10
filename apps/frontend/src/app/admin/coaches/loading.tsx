import { DataTableSkeleton, FilterRowSkeleton } from '@/components/admin/admin-skeletons';

export default function AdminCoachesLoading(): React.ReactElement {
  return (
    <>
      <FilterRowSkeleton />
      <DataTableSkeleton columns={8} rows={10} pagination />
    </>
  );
}
