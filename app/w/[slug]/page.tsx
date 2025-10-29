const Workspace = async ({ params }: { params: Promise<{ slug: string }> }) => {
  return (
    <div>Under construction: {(await params).slug}</div>
  )
}

export default Workspace