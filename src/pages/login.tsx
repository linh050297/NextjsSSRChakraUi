import React from 'react';
import { Formik, Form } from 'formik';
import {
    Box,
    Button,
    Link,
    Flex,
  } from "@chakra-ui/core";
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { NavBar } from '../components/NavBar';
import NextLink from 'next/link'
import { Layout } from '../components/Layout';

interface loginProps {
  
}

const Login: React.FC<{}> = ({...props}) => {

  const router = useRouter();
  const [,login] = useLoginMutation();
  //useLoginMutation là hook được generate từ graphql-code-generator npm

  return (
    <Layout variant="regular">
      <Wrapper>
        <Formik initialValues={{usernameOrEmail:"", password:""}} 
          onSubmit={ async (values, {setErrors}) =>{
            console.log('values: ', values);
            // lấy kết quả từ hook Login
            const response = await login(values);
            console.log('response: ', response);
            if(response.data?.login.errors){

              console.log('errors: ', response.data?.login.errors);
              setErrors(toErrorMap( response.data.login.errors ));

            }else if( response.data?.login.user?.id ){

              if(typeof router.query.next === 'string'){
                //sau khi bị redirect do chưa đăng nhập thì sau khi đăng nhập lại thì redirect vè trang cũ
                router.push(router.query.next);
              }else{
                //sau khi đăng nhập thành công redirect  về homepage
                router.push('/');
              }
              
            }
          }}
        >
          {({isSubmitting})=>(
            <Form>
                <InputField name = 'usernameOrEmail' placeholder="username Or Email..." label="Username"/>  
                <Box mt={4}>
                  <InputField name = 'password' placeholder="password..." label="Password" type="password"/>
                </Box>  
                <Flex mt={3}>
                  <NextLink href="/forgot-password">
                    <Link ml="auto">Bạn quên mật khẩu ?</Link>
                  </NextLink>
                </Flex>
                <Button type="submit" mt={3} isLoading={isSubmitting} >Submit</Button>
            </Form>
          )}
        </Formik>
      </Wrapper>
    </Layout>
  )
        
}

export default withUrqlClient(createUrqlClient)(Login)