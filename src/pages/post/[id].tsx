import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react'
import { Layout } from '../../components/Layout';
import { usePostQuery } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { Button, Stack, Box, Heading, Text, Flex, Link, IconButton} from "@chakra-ui/core";

interface Props {

}

export const Post: React.FC<Props> = ({}) => {

    const router = useRouter();
    const intId = typeof router.query.id === 'string' ? parseInt(router.query.id) : -1;

    const [{data, error, fetching}] = usePostQuery({
        pause: intId === -1,
        variables: { id:  intId }
    });

    if(fetching){
        return (
            <Layout>
                <div>Đang tải bài viết...</div>
            </Layout>
        )
    };

    if(error){
        return (
            <Layout>
                <Heading>Ôi lỗi rồi !!!</Heading>
                <Text>{error.message}</Text>
            </Layout>
        )
    };

    if(!data?.post){
        return (
            <Layout>
                <Heading>Không tìm thấy bài viết trong hệ thống !!!</Heading>
            </Layout>
        )
    }
    
    return (
        <Layout>
            <Heading>{data?.post?.titleSnippet}</Heading>
            <Text> { data?.post?.text} </Text>
        </Layout>
    );
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Post as any)