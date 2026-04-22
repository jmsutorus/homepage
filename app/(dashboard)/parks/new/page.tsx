import { ParkEditorialEditor } from '@/components/widgets/parks/park-editorial-editor';

export const dynamic = "force-dynamic";

export default function NewParkPage() {
  return (
    <ParkEditorialEditor mode="create" />
  );
}
