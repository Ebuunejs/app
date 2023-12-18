import { React,useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import "./App.css";
import "./main.css"

import PortalNavbar from "./dashboard/layout/PortalNavbar";
import PortalFooter from "./dashboard/layout/PortalFooter";

function App () {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const userToken = localStorage.getItem('user-token');
    setIsLoggedIn(!!userToken && userToken !== 'undefined');
  }, [])

  return (
    <div className="App">
  
        {isLoggedIn && <PortalNavbar /> }
            <Outlet />
        {isLoggedIn && <PortalFooter />}
  
    </div>
  );
}

export default App;


/*
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";


const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";

state = {
    events: [
      {
        start: moment().toDate(),
        end: moment().add(1, "days").toDate(),
        title: "Jon Zylfiu",
      },
    ],
  };

  onEventResize = (data) => {
    const { start, end } = data;

    this.setState((state) => {
      state.events[0].start = start;
      state.events[0].end = end;
      return { events: [...state.events] };
    });
  };

  onEventDrop = (data) => {
    console.log(data);
  };



      <div className="App">
        <DnDCalendar
          defaultDate={moment().toDate()}
          defaultView="month"
          events={this.state.events}
          localizer={localizer}
          onEventDrop={this.onEventDrop}
          onEventResize={this.onEventResize}
          resizable
          style={{ height: "100vh" }}
        />
      </div>
      */