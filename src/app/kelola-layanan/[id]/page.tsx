import ManageServiceForm from "@/components/service/manageServiceForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditLayananPage({ params }: PageProps) {
  const { id } = await params;
  return <ManageServiceForm id={id} />;
}
