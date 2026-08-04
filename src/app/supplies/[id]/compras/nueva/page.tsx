import { AddPurchaseView } from "@/features/supplies/components/add-purchase-view";

export default function NewPurchasePage({ params }: { params: { id: string } }) {
  return <AddPurchaseView supplyId={Number(params.id)} />;
}
