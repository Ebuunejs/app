import React, { createContext, useState } from 'react'


export const StepsContext = createContext([]);

const BookingStepsContext = (props) => {
    const [ steps, setSteps ] = useState([]);


    return (
        <StepsContext.Provider value={[steps, setSteps]}>
            {props.children}
        </StepsContext.Provider>
    )

}

export default BookingStepsContext