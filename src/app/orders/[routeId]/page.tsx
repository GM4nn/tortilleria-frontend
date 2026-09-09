import { ZoneDetailView } from "@/features/orders/components/zone-detail-view";

export default function ZonePage({ params }: { params: { routeId: string } }) {
  const id = params.routeId === "sin-zona" ? null : Number(params.routeId);
  return <ZoneDetailView routeId={id} />;
}
