import { Flex, IconButton, Text } from '@chakra-ui/core';
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import React, { useState } from 'react'
import { PostSnippetFragment, PostsQuery, useVoteMutation } from '../generated/graphql';

interface UpDootSectionProps {
    // post: PostsQuery['posts']['posts'][0]
    post: PostSnippetFragment
}

export const UpDootSection: React.FC<UpDootSectionProps> = ({ post }) => {

    const [, vote] = useVoteMutation();
    const [loadingState, setLoadingState] = useState<"updoot-loading" | "downdoot-loading" | "not-loading">("not-loading");

    return (
        <Flex justifyContent="start" alignItems="center" direction="column" mr={10}>
            <IconButton onClick={async () => { 
                setLoadingState("updoot-loading");
                await vote({ postId: post.id, value: 1 });
                setLoadingState("not-loading")
            }}
                isLoading={ loadingState === 'updoot-loading' }
                colorScheme="red"
                aria-label="updoot post"
                icon={<TriangleUpIcon />}
            />
            <Text>{post.points}</Text>
            <IconButton disabled onClick={async () => { 
                setLoadingState("downdoot-loading");
                await vote({ postId: post.id, value: -1 });
                setLoadingState("not-loading")
            }}
                isLoading={ loadingState === 'downdoot-loading' }
                colorScheme="blue"
                aria-label="downdoot post"
                icon={<TriangleDownIcon />}
            />
        </Flex>
    );
}