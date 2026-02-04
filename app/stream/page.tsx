interface StreamPageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function StreamPage({ searchParams }: StreamPageProps) {
  const { id } = await searchParams;

  return <div>Stream Page - ID: {id}</div>;
}
