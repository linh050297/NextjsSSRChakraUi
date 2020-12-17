import React from 'react'
import { Box, Flex, Link, Button, Heading } from '@chakra-ui/core';
import NextLink from 'next/link';
import { useMeQuery, useLogoutMutation } from '../generated/graphql';
import { useRouter } from 'next/router';
import { isServer } from '../utils/isServer';

interface NavBarProps {

}

export const NavBar: React.FC<NavBarProps> = ({ }) => {

  const router = useRouter();
  let pathName = router.pathname;
  console.log('pathName:', pathName);

  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery({ pause: isServer() });
  let body = null;
  if (fetching) {//is loading

  } else if (!data?.me) {//not logged in
    body = (
      <>
        <NextLink href='/login'>
          <Link mr={3}>Login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link>Register</Link>
        </NextLink>
      </>
    )

  } else {//user id logged in
    body = (
      <>
        <Flex>
          <Box mr={3}>{data.me.username}</Box>
          <NextLink href="/post-management">
            <Link mr={3}>Post management</Link>
          </NextLink>
          <Button variant="link" onClick={() => { logout() }} isLoading={logoutFetching} >Logout</Button>
        </Flex>
      </>
    )
  }

  return (
    <Flex zIndex={1} position="sticky" top={0} bg="tomato" p={4} align="center" >
      <NextLink href='/'>
        <Link >
          <Heading>Văn Lĩnh's App</Heading>
        </Link>
      </NextLink>
      <Box ml='auto'>
        {body}
      </Box>
    </Flex>
  );
}