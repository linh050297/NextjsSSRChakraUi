import { isServer } from './isServer';
import gql from 'graphql-tag';
import { VoteMutationVariables } from './../generated/graphql';
import { cursorPagination } from './cursorPagination';
// import { Query } from 'type-graphql';
import { fetchExchange, dedupExchange } from '@urql/core';
import { cacheExchange } from '@urql/exchange-graphcache';
import { LogoutMutation, MeQuery, MeDocument, LoginMutation, RegisterMutation, CreatePostMutation, PaginatedPosts, CreatePostDocument } from '../generated/graphql';
import { betterUpdateQuery } from './betterUpdateQuery';
import { pipe, tap } from 'wonka';
import { Exchange, defaultExchanges } from 'urql';
import Router from 'next/router';
import { devtoolsExchange } from '@urql/devtools';

const errorExchange: Exchange = ({ forward }) => ops$ => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      // If the OperationResult has an error send a request to sentry
      if (error?.message.includes('Not authenticated')) {
        Router.replace('/login');
      }
    })
  );
};

export const createUrqlClient = (ssrExchange: any, ctx: any) =>  { 
  let cookie = '';
  if (isServer()) {
    cookie = ctx?.req?.headers?.cookie;
  }
  
  return ({
    url: 'http://localhost:4000/graphql',
    
    fetchOptions: {
      credentials: 'include' as const,
      headers: cookie ? { cookie } : undefined
    },
    exchanges: [
      dedupExchange,
      cacheExchange({

        keys: {
          PaginatedPosts: () => null
        },

        resolvers: {
          Query: {
            posts: cursorPagination()// tự động tính toán phân trang dưới dạng resolver client tên posts lấy từ graphql 
          }
        },

        updates: {
          Mutation: {

            vote: (_result, args, cache, info) => {
              console.log('_result: ', _result.vote);
              if (_result.vote === true) {
                const { postId, value } = args as VoteMutationVariables;
                const data = cache.readFragment(
                  gql`
                    fragment _ on Post {
                      id
                      points
                    }
                  `,
                  { id: postId } as any
                );
                if (data) {
                  const newPoints = data.points + value;
                  cache.writeFragment(
                    gql`
                      fragment _ on Post {
                        id
                        points
                      }
                    `,
                    { id: postId, points: newPoints }
                  );
                }
              }
            },

            createPost: (_result, args, cache, info) => {// khi tạo bài viết mới thì refetch câu query
              const allFields = cache.inspectFields('Query');
              const fieldInfos = allFields.filter(
                (info) => info.fieldName === 'posts'
              );
              console.log('fieldInfos: ', fieldInfos);
              // arguments: {limit: 10}
              // fieldKey: "posts({"limit":10})"
              // fieldName: "posts"
              fieldInfos.forEach((fi) => {
                cache.invalidate('Query', "posts", fi.arguments || {}) //xóa cache posts để query lại lấy all posts
              })

            },
            logout: (_result, args, cache, info) => {
              betterUpdateQuery<LogoutMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                () => {
                  return ({ me: null })
                }
              )
            },
            login: (_result, args, cache, info) => {
              betterUpdateQuery<LoginMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.login.errors) {
                    return query
                  } else {
                    return { me: result.login.user }
                  };
                }
              );
            },
            register: (_result, args, cache, info) => {
              betterUpdateQuery<RegisterMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.register.errors) {
                    return query
                  } else {
                    return { me: result.register.user }
                  };
                }
              );
            },
          }
        },
      }),
      errorExchange,
      ssrExchange,
      fetchExchange,
      devtoolsExchange,
      ...defaultExchanges
    ]
  })
}