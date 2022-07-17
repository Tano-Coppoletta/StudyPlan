import { useState } from "react";
import { Navbar, Container, Form, FormControl, Button, Nav } from "react-bootstrap";
import {MortarboardFill} from 'react-bootstrap-icons';
import { useNavigate } from "react-router-dom";


function MyNavbar(props){
   

    const navigate=useNavigate();
    
    const logoutButton = () => {
        
            return (
                <Button variant="danger" onClick={(event)=> {event.preventDefault(); props.setLoginPage(false);props.handleLogout()}}>Logout</Button>
            )
        
    }

    const loginButton = () => {
        
            return (
                <Button variant="success" onClick={(event) => {event.preventDefault(); props.setLoginPage(true); navigate('/login')}}>Login</Button>
                
            )
        
    }

    const coursesPage = () => {
        return (
            <Button variant="success" onClick={(event) => {event.preventDefault();props.setLoginPage(false); navigate('/')}}>Courses</Button>
        )
    }

    return ( 
    
        <Navbar bg="dark" variant="dark">
            <Container fluid>
                <Navbar.Brand >
                    <MortarboardFill width="30" height="24" style={{color : "#FFFF"}}/>
                </Navbar.Brand>
                <Navbar.Text>Study Plan</Navbar.Text>
                
                {props.isLoggedIn ?  logoutButton() : props.isLoginPage ? coursesPage() :loginButton() }
            </Container>
        </Navbar>
       )

}

export default MyNavbar;