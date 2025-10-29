const Page = async ({ params }: { params: Promise<{ username: string }> }) => {
  const { username } = await params;
  return (
    <div>User Profile Page for {username}</div>
  )
}

export default Page