import { SupplyDetailView } from "@/features/supplies/components/supply-detail-view";

export default function SupplyDetailPage({ params }: { params: { id: string } }) {
  return <SupplyDetailView supplyId={Number(params.id)} />;
}
