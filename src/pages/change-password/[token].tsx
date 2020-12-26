import React from 'react';
import { Formik, Form } from 'formik';
import {
  Button,
  Alert,
  AlertIcon,
  AlertDescription,
  CloseButton,
  Link
} from "@chakra-ui/core";
import { Wrapper } from '../../components/Wrapper';
import { InputField } from '../../components/InputField';
import { useChangePasswordFromTokenMutation } from '../../generated/graphql';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { NavBar } from '../../components/NavBar';
import { NextPage } from 'next';
import NextLink from 'next/link';
import { Layout } from '../../components/Layout';


const ChangePassword: NextPage/*<{ token: string } >*/ = (/*{ token }*/) => {

  const [isOpen, setIsOpen] = React.useState({ display: 'block', trans: "ease-in", isError: "false", errorMessage: '', errorField: '' });
  const onClose = () => setIsOpen({ display: "none", trans: "ease-out", isError: '', errorMessage: '', errorField: '' });

  const router = useRouter();

  const [, changePasswordFromToken] = useChangePasswordFromTokenMutation();

  return (
    <Layout variant="regular">
      <Wrapper>
        <Formik initialValues={{ newPassword: "" }}
          onSubmit={async (values, { setErrors }) => {
            // lấy kết quả từ hook Login
            const response = await changePasswordFromToken({ 
              newPassword: values.newPassword, 
              token: typeof router.query.token === "string" ?  router.query.token : ""
            });

            if (response.data?.changePasswordFromToken.user) {
              //   const loginUser = await login({ usernameOrEmail: response.data?.changePasswordFromToken.user.username, password: values.newPassword });
              //   if(loginUser.data?.login.errors){
              //     setIsOpen({ isError: 'true', display:"block", trans:"ease-out", errorMessage:loginUser.data?.login.errors[0].message });
              //   }
              router.push('/');
            }

            if (response.data?.changePasswordFromToken.errors) {
              setIsOpen({
                isError: 'true',
                display: "block",
                trans: "ease-out",
                errorMessage: response.data?.changePasswordFromToken.errors[0].message,
                errorField: response.data?.changePasswordFromToken.errors[0].field
              });
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              {isOpen.isError == 'true' ?
                <Alert transition={isOpen.trans} display={isOpen.display} status="error" >
                  <AlertIcon />
                  <AlertDescription>{isOpen.errorMessage}</AlertDescription>
                  <CloseButton onClick={onClose} position="absolute" right="8px" top="8px" />
                </Alert>
                : ''}
              <InputField type="password" name='newPassword' placeholder="New Password..." label="New Password" />
              {isOpen.errorField == 'token' ?
                <NextLink href="/forgot-password">
                  <Link style={{ color: '#ff3333', marginTop: '4px', display: 'block' }} >Bạn quên mật khẩu ?</Link>
                </NextLink> : ''
              }
              <Button type="submit" mt={3} isLoading={isSubmitting} >Xác nhận mật khẩu mới</Button>
            </Form>
          )}
        </Formik>
      </Wrapper>
    </Layout>
  )

}

// ChangePassword.getInitialProps = ({ query }) => {
//   return {
//     token: query.token as string
//   }
// }

export default withUrqlClient(createUrqlClient)(ChangePassword as any)