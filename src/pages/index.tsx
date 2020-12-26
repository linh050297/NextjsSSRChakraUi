import { PartialNextContext, withUrqlClient } from 'next-urql';
import { createUrqlClient } from "../utils/createUrqlClient";
import { useDeletePostMutation, usePostsQuery, useVoteMutation, useMeQuery } from "../generated/graphql";
import { Layout } from "../components/Layout";
import { Button, Stack, Box, Heading, Text, Flex, Link, IconButton } from "@chakra-ui/core";
import NextLink from 'next/link';
import React, { useState } from 'react';
import { UpDootSection } from '../components/UpDootSection';
import { DeleteIcon, EditIcon, TriangleDownIcon } from '@chakra-ui/icons';
import { isServer } from '../utils/isServer';



const Index = () => {

  const [variables, setVariables] = useState({ limit: 10, cursor: null as null | string });
  const [{ data, fetching }] = usePostsQuery({
    variables
  });

  const [{ data : dataMe , fetching: meFetching }] = useMeQuery({ pause: isServer() });

  // if(data){
  //   let userId: string | null = typeof window !== 'undefined' ? localStorage.getItem('userId') : null
  //   console.log('userId: ', userId);
  // }

  const [, deletePost] = useDeletePostMutation();

  // const [{_,vote}] = useVoteMutation()

  if (!data && !fetching && !meFetching) {
    return <div>Không có bài post nào !!!</div>
  }

  return (
    <Layout variant="regular">
      <Flex mb="10px">
        <Heading >Bài viết</Heading>
        <NextLink href="/create-post">
          <Button ml="auto">Tạo bài viết</Button>
        </NextLink>
      </Flex>

      {
        !data && fetching ? (<div>Loading...</div>) :
          <Stack spacing={8}>
            {data!.posts.posts.map((p) =>
              !p ? null :
              (<Flex key={p.id} p={5} shadow="md" borderWidth="1px">
                <UpDootSection post={p} />
                <Box flex={1} >
                  <Flex>
                    <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                      <Link>
                        <Heading fontSize="xl">{p.titleSnippet}</Heading>
                      </Link>
                    </NextLink>
                    <Text fontSize={14} ml="8px">Tác giả: {p.creator.username}</Text>
                  </Flex>
                  <Heading fontSize="14px">Nội dung:</Heading>
                  <Flex>
                    <Text mt={1}>{p.textSnippet}</Text>
                    <IconButton ml="auto" isDisabled = { !dataMe?.me || dataMe.me.id !== p.creatorId ? true : false } onClick={async () => { 
                        await deletePost({id: p.id });
                      }}
                        colorScheme="red"
                        aria-label="delete_post"
                        icon={<DeleteIcon />}
                    />
                    <IconButton ml="7px" isDisabled = { !dataMe?.me || dataMe.me.id !== p.creatorId ? true : false } onClick={async () => { 
                        await deletePost({id: p.id });
                      }}
                        colorScheme="blue"
                        aria-label="edit_post"
                        icon={<EditIcon />}
                    />
                  </Flex>
                </Box>
              </Flex>)
            )}
          </Stack>
      }
      { data && data.posts.hasMore ?
        <Flex>
          <Button onClick={
            () => {
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt
              })
            }
          } isLoading={fetching} margin="auto" marginY={7}>Xem thêm...</Button>
        </Flex> : null
      }

    </Layout>
  )
}

// Index.getInitialProps = ({req: {headers: {cookie}}}: PartialNextContext) => {
//   console.log('cookie: ', cookie);
// }

export default withUrqlClient(createUrqlClient, { ssr: true })(Index)
