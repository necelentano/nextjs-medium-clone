import { GetStaticPaths, GetStaticProps } from 'next'
import Image from 'next/image'
import PortableText from 'react-portable-text'
import Header from '../../components/Header'
import { sanityClient, urlFor } from '../../sanity'
import { Post } from '../../types'

interface Props {
    post: Post
}

const Post = ({post}:Props) => {
    console.log({post})
  return (
    <main>
        <Header />

        <div className="relative w-full h-40">
            <Image priority layout="fill" objectFit="cover" src={urlFor(post.mainImage).url()!} alt={post.title}/>
        </div>
        <article className="max-w-3xl mx-auto p-5">
            <h1 className="text-3xl mt-10 mb-3">{post.title}</h1>
            <h2 className="text-xl font-light text-gray-500 mb-2">{post.description}</h2>
            <div className="flex items-center space-x-2">
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    <Image src={urlFor(post.author.image).url()!} alt={post.author.name} layout="fill" objectFit="cover" />
                </div>
                <p className="font-extralight text-sm">Blog post by <span className="text-green-600">{post.author.name}</span> - Published at {new Date(post._createdAt).toLocaleString()}</p>
            </div>
            <div className="mt-10">
                <PortableText 
                    content={post.body} 
                    dataset={process.env.NEXT_PUBLIC_SANITY_DATASET} 
                    projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}
                    serializers={{
                        h1: (props:any) => <h1 className="text-2xl font-bold my-5" {...props} />,
                        h2: (props:any) => <h2 className="text-xl font-bold my-5" {...props} />,
                        normal: (props:any) => <p className="my-5" {...props} />,
                        li: ({ children}:any) => <li className="ml-4 list-disc">{children}</li>,
                        link: ({href, children}: any) => <a href={href} className="text-blue-500 hover:underline">{children}</a>
                      }}
                    />
                    
            </div>
        </article>
    </main>
  )
}

export default Post

export const getStaticPaths:GetStaticPaths = async () => {
    const query = `*[_type == "post"]{
        _id,
        slug {
            current
        }
    }`

    const posts = await sanityClient.fetch(query)

    const paths = posts.map((post:Post) => ({params: {slug: post.slug.current}}))

    return {
        paths,
        fallback: 'blocking', // can also be true or false
      }
}

export const getStaticProps:GetStaticProps = async ({params}) => {
    const query = `*[_type == "post" && slug.current == $slug][0]{
        _id,
        _createdAt,
        title,
        author -> {
            name,
            image
        },
        description,
        mainImage,
        slug,
        body
      }`

    const post = await sanityClient.fetch(query, {
        slug: params?.slug
    })

    if(!post) return {notFound: true}

    return {
        // Passed to the page component as props
        props: { post },
        revalidate: 60 // after 60 seconds it will update the old cached version 
    }

}