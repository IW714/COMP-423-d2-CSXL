# Floor Plan Editor Guide

## Overview
The Floor Plan Editor is an integral feature of the CSXL website, designed to enable admins and developers to manage and customize the layout of rooms and seating arrangements. This document provides a comprehensive guide for using the editor effectively and includes insights into its technical implementation and user experience.

## Accessing the Floor Plan Editor
To access the Floor Plan Editor, you must have administrative privileges. Follow these steps to open the editor:
1. Log in to the CSXL website with your admin credentials.
2. Navigate to the `Admin Dashboard`.
3. Select `Floor Plan Editor` from the menu options.

## Features
### Managing Seats
The Floor Plan Editor allows for detailed management of seats within rooms. Users can perform CRUD (Create, Read, Update, Delete) operations, which are visually interactive and intuitive.

### Adding a Seat (Create)
- **Action:** To add a seat, click on the 'Create Seat' button, which opens a modal where you can specify additional seat details. After filling out the details, drag the seat icon to the desired location within the room layout.
- **User Experience:** The interface provides a form to enter seat attributes such as type, capacity, and availability. Once added, the seat appears interactively within the layout, allowing for immediate placement and adjustment.

### Viewing Seat Details (Read)
- **Action:** Click on any seat to view its detailed information in a panel below the map.
- **User Experience:** This provides a quick overview of the seat's characteristics without leaving the editor, enhancing the ease of management and oversight.

### Moving a Seat (Update)
- **Action:** To move a seat, click and hold on an existing seat, then drag it to a new location.
- **User Experience:** A real-time preview of the seat's new position is shown as it is dragged across the layout, providing immediate visual feedback.

### Deleting a Seat (Delete)
- **Action:** Select a seat and press the delete key.
- **User Experience:** The seat is removed from the layout immediately.

## Technical Implementation of Seat Operations
#### Backend
The backend services for seat and table operations are implemented using FastAPI. It manages interactions with a PostgreSQL database through SQLAlchemy ORM for CRUD operations. Key API endpoints include:
- `GET /api/seat`: Retrieves all seats.
- `POST /api/seat`: Creates a new seat.
- `PUT /api/seat`: Updates an existing seat.
- `DELETE /api/seat/{id}`: Deletes a seat by ID.

- `GET /api/table`: Retrieves all tables.
- `POST /api/table`: Creates a new table.
- `PUT /api/table`: Updates an existing table.
- `DELETE /api/table/{id}`: Deletes a table by ID.

#### Frontend
The frontend is implemented using Angular and interacts with the backend via RESTful APIs.

#### RoomLayoutEditor Component
The `RoomLayoutEditorComponent` handles the rendering and interactive logic for seats and tables within the editor. It uses observables to react to data changes and update the UI accordingly, providing a seamless user experience.

#### RoomEditor Component
The `RoomEditorComponent` handles the submission of the room-editor form and floor plan. It also handles room dimensions and buttons for creating seats and tables.

#### RoomItem
The `RoomItem` class serves as a hub for handling the movement, resizing, and rotation of RoomItems, as well as an implementation of the RoomItemInterface class. The movement, resizing, and rotation functionality has been moved out of the `RoomItemService` and into this class to provide better modularity.

#### Seat
Acts as an extension of the `RoomItem` class and implements the `SeatInterface`.

#### Table
Acts as an extension of the `RoomItem` class and implements the `TableInterface`.

#### RoomItem Service
The `RoomItemService` is the foundation of the Floor Plan Editor. The service handles all interactions between the editor and the backend, specifically CRUD operations with the backend. The service also delegates all transformations of seats and tables in the frontend to the RoomItem class. It is quite an extensive file and should be simplified as much as possible.

## Best Practices
- Ensure you save changes frequently to avoid losing your progress. Use the `Save` button located at the top right corner of the editor.
- Regularly update the room and seating configurations to reflect any physical changes in the layout.
- Coordinate with other admins to ensure consistency in room and seat management.

## Limitations
- Generally the editor suffers from a slight degree of coupling between the Room-Item-Service and the Seat, Table, and RoomItem classes. Due to how the updateLines() method works along with a couple others, the Room-Item-Service must be injected into some of the classes' methods in order to properly work.
- We were unable to implement individual Seat and Table widgets to replace the code in the `RoomLayoutEditor.html` file. If possible, future developers should find a way to do this.

## Troubleshooting
If you encounter any issues while using the Floor Plan Editor:
1. Refresh the page and try again.
2. Check for browser compatibility; we recommend using the latest version of Chrome or Firefox.
3. Contact the team if problems persist.

## Conclusion
The Floor Plan Editor is designed to provide a flexible and user-friendly interface for managing the physical space arrangements on the CSXL website. By following this guide and understanding the technical implementation and user experience, you should be able to effectively use the tool to enhance the functionality and efficiency of space utilization.

For additional support or feedback, please reach out to the CSXL development team.
