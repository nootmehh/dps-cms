import ManageProductForm from "@/components/product/manageProductForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProdukPage({ params }: PageProps) {
  const { id } = await params;
  return <ManageProductForm id={id} />;
}
