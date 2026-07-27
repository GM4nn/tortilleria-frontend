import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";

export function ComingSoon({ title }: { title: string }) {
  return (
    <>
      <PageHeader title={title} />
      <Card>
        <CardContent className="flex h-64 items-center justify-center text-muted-foreground">
          Módulo en construcción — próxima entrega.
        </CardContent>
      </Card>
    </>
  );
}
