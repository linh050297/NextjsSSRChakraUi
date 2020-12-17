import React, { useEffect } from 'react'
import { Formik, Form } from 'formik';
import { useCreatePostMutation, useMeQuery } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { InputField } from '../components/InputField';
import { Box, Button } from '@chakra-ui/core';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import {useRouter} from 'next/router';
import { Layout } from '../components/Layout';



const CreatePost: React.FC<{}> = ({ }) => {
    const router = useRouter();
    const [, createPost] = useCreatePostMutation();
    const [{data, fetching}] = useMeQuery();
    useEffect(() => {
        if(!fetching && !data?.me){
            router.replace('/login?next='+ router.pathname)
        }
    }, [fetching, data, router])

    return (
        <Layout variant="regular">
            <Formik initialValues={{ title: "", text: "" }}
                onSubmit={async (values, { setErrors }) => {
                    console.log('values: ', values);
                    // lấy kết quả từ hook createPost
                    const { error } = await createPost({input: values});
                    console.log('response error: ', error);
                    if(!error){
                        router.push('/');
                    }
                    
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField name='title' placeholder="Title..." label="Title" />
                        <Box mt={4}>
                            <InputField textarea name='text' placeholder="Text..." label="Text" type="text" />
                        </Box>
                        <Button type="submit" mt={3} isLoading={isSubmitting} >Tạo mới</Button>
                    </Form>
                )}
            </Formik>
        </Layout>
    );
}

export default withUrqlClient(createUrqlClient)(CreatePost)