import { AddPurchaseView } from "@/features/supplies/components/add-purchase-view";

export default function EditPurchasePage({
  params,
}: {
  params: { id: string; purchaseId: string };
}) {
  return (
    <AddPurchaseView supplyId={Number(params.id)} purchaseId={Number(params.purchaseId)} />
  );
}
