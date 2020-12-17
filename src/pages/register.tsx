import React from 'react';
import { Formik, Form } from 'formik';
import {
    Box,
    Button,
  } from "@chakra-ui/core";
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { NavBar } from '../components/NavBar';
import { Layout } from '../components/Layout';

interface registerProps {

}

const Register: React.FC<registerProps> = ({}) => {

  const router = useRouter();
  const [,register] = useRegisterMutation();
  //useRegisterMutation là hook được generate từ graphql-code-generator npm

  return (
    <Layout variant="regular">
      <Formik initialValues={{username:"", password:"", email:""}} 
        onSubmit={ async (values, {setErrors}) =>{
          console.log('values: ', values);
          // lấy kết quả từ hook Register
          const response = await register(values);
          if(response.data?.register.errors){
            console.log('response.data?.register.errors: ', response.data?.register.errors);

            setErrors(toErrorMap( response.data?.register.errors ));

          }else if( response.data?.register.user?.id ){
            //sau khi đăng ký thành công redirect  về homepage
            router.push('/');
          }
        }}
      >
        {({isSubmitting})=>(
          <Form>
              <InputField name = 'username' placeholder="username..." label="Username"/>  
              <Box mt={4}>
                <InputField name = 'password' placeholder="password..." label="Password" type="password"/>
              </Box>  
              <Box mt={4}>
                <InputField name = 'email' placeholder="email..." label="email" type="email"/>
              </Box> 
              <Button type="submit" mt={3} isLoading={isSubmitting} >Submit</Button>
          </Form>
        )}
      </Formik>
    </Layout>
  )
        
}

export default withUrqlClient(createUrqlClient)(Register)

// select title, text from post where to_tsvector(title) @@ to_tsquery('ống') or lower(unaccent(title)) = lower(unaccent('THỢ'));
// CREATE EXTENSION unaccent;

//câu query search: **********
// select * from post where document_idx @@ to_tsquery('bai & post')
// or  tsvector_unaccent_idx @@ to_tsquery('bai & post')
// order by ts_rank(document_idx, plainto_tsquery('bài post'))

//câu query đánh index field sau mã hóa *******
// alter table post add column document_idx tsvector;
// update post set document_idx = to_tsvector(coalesce(title, ''));
// create index document_idx on post using gin (document_idx);

//trigger *********
// create function post_tsvector_trigger() returns trigger as $$
// begin
// 	new.document_idx :=
// 	to_tsvector(coalesce(new.title, ''));
// 	return new;
// end
// $$ LANGUAGE plpgsql;

// create trigger tsvectorupdate before insert or update 
// 	on post for each row execute procedure post_tsvector_trigger();

// câu query search vip*******
// select * from post where 
// document_idx @@ to_tsquery('bài & viet & moi') --đầy đủ dấu cả 2 chữ đúng
// or  document_idx @@ to_tsquery('bài | viet | moi') --đủ dấu 1 trong 2 chữ đúng
// or  tsvector_unaccent_idx @@ to_tsquery('bài & viet & moi') --không dấu cả hai chữ đúng
// or  tsvector_unaccent_idx @@ to_tsquery('bài | viet | moi') --không dấu 1 trong 2 chữ đúng
// order by ts_rank(tsvector_unaccent_idx, plainto_tsquery('bài viet moi')) DESC
//    ,ts_rank(document_idx, plainto_tsquery('bài viet moi')) DESC

//hợp thành bảng chung ko dấu vs có dấu
// alter table post add column document_idx tsvector;
// update post set document_idx = to_tsvector( coalesce(title, '') || ' ' ||unaccent(coalesce(title, '')));

// ****************
// select * from post where 
// --  document_idx @@ to_tsquery('bài & viet & moi') --đầy đủ dấu cả 2 chữ đúng
//   document_idx @@ to_tsquery('dung | đi') --đủ dấu 1 trong 2 chữ đúng
// --  or  tsvector_unaccent_idx @@ to_tsquery('bài & viet & moi') --không dấu cả hai chữ đúng
// and document_idx @@ plainto_tsquery('dung di') --không dấu 1 trong 2 chữ đúng
//  order by 
// --  ts_rank(tsvector_unaccent_idx, plainto_tsquery('bài viet moi')) DESC
// --     ,
// 	ts_rank(document_idx, plainto_tsquery('dung đi')) DESC