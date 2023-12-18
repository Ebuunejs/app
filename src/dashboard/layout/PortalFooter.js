import React from "react";
import { Container } from "react-bootstrap";
const PortalFooter = () => {
    return (
        <React.Fragment>
            <footer className="bg-light border-top py-3 fixed-bottom">
                <Container>
                    &copy; designed by 4pixels GmbH - 2023
                </Container>
            </footer>
        </React.Fragment>
    );
}
export default PortalFooter;