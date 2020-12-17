import { PartialNextContext, withUrqlClient } from 'next-urql';
import { createUrqlClient } from "../utils/createUrqlClient";
import { useDeletePostMutation, usePostsQuery, useVoteMutation } from "../generated/graphql";
import { Layout } from "../components/Layout";
import { Button, Stack, Box, Heading, Text, Flex, Link, IconButton } from "@chakra-ui/core";
import NextLink from 'next/link';
import React, { useState } from 'react';
import { UpDootSection } from '../components/UpDootSection';
import { DeleteIcon, TriangleDownIcon } from '@chakra-ui/icons';

const Index = () => {

  const [variables, setVariables] = useState({ limit: 10, cursor: null as null | string });
  const [{ data, fetching }] = usePostsQuery({
    variables
  });

  const [, deletePost] = useDeletePostMutation();

  // const [{_,vote}] = useVoteMutation()

  if (!data && !fetching) {
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
            {data!.posts.posts.map(p =>
              <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
                <UpDootSection post={p} />
                <Box>
                  <Flex>
                    <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                      <Link>
                        <Heading fontSize="xl">{p.titleSnippet}</Heading>
                      </Link>
                    </NextLink>
                    <Text fontSize={14} ml="8px">Tác giả: {p.creator.username}</Text>
                  </Flex>
                  <Heading fontSize="14px">Nội dung:</Heading>
                  <Text mt={1}>{p.textSnippet}</Text>
                </Box>
                
                  <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                    <Link>
                    <IconButton disabled onClick={async () => { 
                      await deletePost({id: p.id });
                    }}
                        colorScheme="red"
                        aria-label="downdoot post"
                        icon={<DeleteIcon />}
                    />
                    </Link>
                  </NextLink>
                
              </Flex>
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
