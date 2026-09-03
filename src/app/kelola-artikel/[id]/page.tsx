import ManageArticleForm from "@/components/article/manageArticleForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArtikelPage({ params }: PageProps) {
  const { id } = await params;
  return <ManageArticleForm id={id} />;
}
