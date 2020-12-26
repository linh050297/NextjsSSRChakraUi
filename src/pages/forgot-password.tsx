import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import {
    Button, Box,
  } from "@chakra-ui/core";
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { useForgotPasswordMutation } from '../generated/graphql';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { NavBar } from '../components/NavBar';
import { Layout } from '../components/Layout';

const ForgotPassword: React.FC<{}> = ({}) => {

  const router = useRouter();
  //useLoginMutation là hook được generate từ graphql-code-generator npm
  const [complete, setComplete] = useState(false);
  const [,forgot] = useForgotPasswordMutation();

  return (
    <Layout variant="regular">
      <Wrapper>
        <Formik initialValues={{email:""}} 
          onSubmit={ async (values) =>{
            console.log('values: ', values);
            // lấy kết quả từ hook Login
            const response = await forgot(values);
            setComplete(true);
            
          }}
        >
          {({isSubmitting})=> complete ? 
          <Box>
            Nếu email bạn cung cấp tồn tại, thì chúng tôi sẽ gửi cho bạn email xác nhận
          </Box> : (
            <Form>
                <InputField type="email" name='email' placeholder="Email đã đăng ký tài khoản..." label="Email"/>  
                <Button type="submit" mt={3} isLoading={isSubmitting} >Nhận Email</Button>
            </Form>
          )}
        </Formik>
      </Wrapper>
    </Layout>
  )
        
}

export default withUrqlClient(createUrqlClient)(ForgotPassword)