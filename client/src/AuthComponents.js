import { useEffect, useState } from 'react';
import {Form, Button, Row, Col, Container} from 'react-bootstrap';

function LoginForm(props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() =>{
    props.setLoginPage(true);
  },[])
  
  const handleSubmit = (event) => {
      event.preventDefault();
      const credentials = { username, password };
      
      props.login(credentials);
  };

  return (
    <Container fluid>
      <Row className="justify-content-md-center">
        <Col sm={6}>
          <h1>Login</h1>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId='username' className="mb-2">
                <Form.Label>Username</Form.Label>
                <Form.Control type='email' value={username} placeholder="Email" onChange={ev => setUsername(ev.target.value)} required={true} />
            </Form.Group>

            <Form.Group controlId='password' className="mb-2">
                <Form.Label>Password</Form.Label>
                <Form.Control type='password' value={password} placeholder="Password" onChange={ev => setPassword(ev.target.value)} required={true} minLength={6}/>
            </Form.Group>

            <Button type="submit">Login</Button>
            
          </Form>
        </Col>
      </Row>
  </Container>
  )
};


export { LoginForm };