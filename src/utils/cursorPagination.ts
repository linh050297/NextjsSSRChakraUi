import { Resolver } from "@urql/exchange-graphcache";
import { stringifyVariables } from "urql";

export const cursorPagination = (): Resolver => {
    return (_parent, fieldArgs, cache, info) => {
      const { parentKey: entityKey, fieldName } = info;
      
      const allFields = cache.inspectFields(entityKey);
      const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
      const size = fieldInfos.length;
      if (size === 0) {
        return undefined;
      };

      const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
      const isItInTheCache = cache.resolve(
        cache.resolveFieldByKey(entityKey, fieldKey) as string,
        "posts"
      );
      info.partial = !isItInTheCache;
      const results:string[] = [];
      let hasMore = true;

      fieldInfos.forEach(fi =>{

        const key = cache.resolveFieldByKey(entityKey, fi.fieldKey) as string;
        // console.log('fi.fieldKey: ', fi.fieldKey); //posts({"limit":10})
        // console.log('entityKey: ', entityKey); //Query
        // console.log('key: ', key); //Query.posts({"limit":10})
        const _hasMore = cache.resolve(key, 'hasMore');
        if(!_hasMore){
          hasMore = _hasMore as boolean;
        }
        const data = cache.resolve(key, 'posts') as string[];
        results.push(...data)
      })
      return {
        __typename: "PaginatedPosts",
        hasMore,
        posts: results
      };
  
    //   const visited = new Set();
    //   let result: NullArray<string> = [];
    //   let prevOffset: number | null = null;
  
    //   for (let i = 0; i < size; i++) {
    //     const { fieldKey, arguments: args } = fieldInfos[i];
    //     if (args === null || !compareArgs(fieldArgs, args)) {
    //       continue;
    //     }
  
    //     const links = cache.resolveFieldByKey(entityKey, fieldKey) as string[];
    //     const currentOffset = args[offsetArgument];
  
    //     if (
    //       links === null ||
    //       links.length === 0 ||
    //       typeof currentOffset !== 'number'
    //     ) {
    //       continue;
    //     }
  
    //     const tempResult: NullArray<string> = [];
  
    //     for (let j = 0; j < links.length; j++) {
    //       const link = links[j];
    //       if (visited.has(link)) continue;
    //       tempResult.push(link);
    //       visited.add(link);
    //     }
  
    //     if (
    //       (!prevOffset || currentOffset > prevOffset)
    //     ) {
    //         result = [...tempResult, ...result];
    //     }
  
    //     prevOffset = currentOffset;
    //   }
  
    //   const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
    //   if (hasCurrentPage) {
    //     return result;
    //   } else if (!(info as any).store.schema) {
    //     return undefined;
    //   } else {
    //     info.partial = true;
    //     return result;
    //   }
    };
  };